use anyhow::{anyhow, bail, Result};
use async_trait::async_trait;
use jsonschema::{JSONSchema, ValidationError};
use log::{error, trace};
use nanoid::nanoid;

use crate::{config::Config, prelude::*};

// TODO: validate metadata
#[derive(Clone, Debug)]
pub struct PendingCar {
    id: String,
    meta: MetaData,
}

pub struct PendingCarQueue {
    queue: Vec<PendingCar>,
    meta_schema: JSONSchema,
    default_meta_data: String,
    on_change: tokio::sync::watch::Sender<Vec<PendingCar>>,
    watcher: tokio::sync::watch::Receiver<Vec<PendingCar>>,
}

impl PendingCarQueue {
    pub fn new(config: &Config) -> Self {
        let queue = vec![PendingCar {
            id: nanoid!(),
            meta: config.record.metadata.default.to_string(),
        }];
        let (on_change, watcher) = tokio::sync::watch::channel(queue.clone());
        let meta_schema = JSONSchema::compile(&config.record.metadata.schema)
            .unwrap_or_else(|e| panic!("Invalid metadata schema! {:?}", e));

        meta_schema
            .validate(&config.record.metadata.default)
            .unwrap_or_else(|e| {
                panic!(
                    "Invalid default metadata! ({:?})",
                    e.collect::<Vec<ValidationError>>()
                )
            });

        PendingCarQueue {
            queue,
            meta_schema,
            default_meta_data: config.record.metadata.default.to_string(),
            on_change,
            watcher,
        }
    }

    pub fn insert(&mut self, meta: MetaData, index: Option<usize>) -> Result<()> {
        trace!("Inserting");
        let car = PendingCar {
            id: nanoid!(),
            meta,
        };

        self.validate_record(&car)?;

        if let Some(index) = index {
            if index > self.queue.len() {
                bail!("Index {} was too large", index);
            }

            self.queue.insert(index, car);
        } else {
            self.queue.push(car);
        }

        self.promote_change();

        Ok(())
    }

    pub fn remove(&mut self, id: &str) -> Result<()> {
        trace!("Removing");
        let index = self.find_car_index(id)?;
        self.queue.remove(index);

        if self.queue.len() == 0 {
            self.insert(self.default_meta_data.clone(), None)
                .map_err(|e| anyhow!("Logic Error {}", e))?;
        }

        self.promote_change();
        Ok(())
    }

    pub fn update(&mut self, id: &str, meta: String) -> Result<()> {
        trace!("Updating metadata {:?} for id {:?}", meta, id);
        let index = self.find_car_index(id)?;

        let current_record = self.queue.get(index).ok_or(anyhow!("Logic Error"))?;

        let new_record = PendingCar {
            meta,
            ..current_record.clone()
        };

        /*self.queue
        .get_mut(index)
        .ok_or(anyhow!("Logic Error"))?
        .meta = meta;*/

        *self.queue.get_mut(index).ok_or(anyhow!("Logic Error"))? = new_record;

        self.promote_change();
        Ok(())
    }

    pub fn insert_many(
        &mut self,
        metas: impl Iterator<Item = String>,
        position: Option<usize>,
    ) -> Result<()> {
        trace!("Insert many");

        let position = position.unwrap_or(self.queue.len());

        if position > self.queue.len() {
            bail!("Index {} was too large", position);
        }

        let new_records = metas
            .map(|meta| PendingCar {
                id: nanoid!(),
                meta,
            })
            .collect::<Vec<PendingCar>>();

        if !new_records
            .iter()
            .all(|record| self.validate_record(record).is_ok())
        {
            bail!("Request includes invalid record!");
        }

        self.queue.splice(&position..&position, new_records);

        self.promote_change();
        Ok(())
    }

    pub fn remove_all(&mut self) -> Result<()> {
        trace!("Remove all");
        self.queue.clear();

        if self.queue.len() == 0 {
            self.insert(self.default_meta_data.clone(), None)
                .map_err(|e| anyhow!("Logic Error {}", e))?;
        }

        // NOTE: promote_changeはinsertで行われているので省略

        Ok(())
    }

    pub fn replace(&mut self, metas: impl Iterator<Item = String>) -> Result<()> {
        trace!("Replacing");

        let new_records = metas
            .map(|meta| PendingCar {
                id: nanoid!(),
                meta,
            })
            .collect::<Vec<PendingCar>>();

        if !new_records
            .iter()
            .all(|record| self.validate_record(record).is_ok())
        {
            bail!("Request includes invalid record!");
        }

        if self.queue.len() == 0 {
            self.insert(self.default_meta_data.clone(), None)
                .map_err(|e| anyhow!("Logic Error {}", e))?;
        }

        self.queue = new_records;
        self.promote_change();
        Ok(())
    }

    pub fn watcher(&self) -> &tokio::sync::watch::Receiver<Vec<PendingCar>> {
        &self.watcher
    }

    fn find_car_index(&mut self, car_id: &str) -> Result<usize> {
        if let Some(index) = self.queue.iter().position(|car| &car.id == car_id) {
            Ok(index)
        } else {
            Err(anyhow!("No such car {}", car_id))
        }
    }

    fn promote_change(&self) {
        trace!("Promoting change");
        if let Err(error) = self.on_change.send(self.queue.clone()) {
            error!("Failed to promote change. ({:?})", error);
        }
    }

    fn validate_record(&mut self, pending_car: &PendingCar) -> Result<()> {
        self.meta_schema
            .validate(&serde_json::from_str::<serde_json::Value>(
                &pending_car.meta,
            )?)
            .map_err(|_| anyhow!("Metadata validation failed."))?;
        Ok(())
    }

}

#[async_trait]
impl crate::running_observer::NextCarQueue for PendingCarQueue {
    async fn consume_next_car(&mut self) -> Option<MetaData> {
        if self.queue.len() == 0 {
            return None;
        }

        let consumed_meta = self.queue.remove(0).meta;

        if self.queue.len() == 0 {
            self.insert(self.default_meta_data.clone(), None)
                .unwrap_or_else(|e| error!("Logic Error {}", e));
        }

        self.promote_change();

        Some(consumed_meta)
    }
}

pub mod server {
    use async_trait::async_trait;
    use log::trace;
    use std::{pin::Pin, sync::Arc};
    use tokio::sync::Mutex;
    use tokio_stream::Stream;
    use tonic::{Request, Status};

    use super::PendingCarQueue;
    use crate::proto::pending_car_queue::{self as proto, ReadAllReply};

    #[async_trait]
    impl proto::pending_car_queue_server::PendingCarQueue for Arc<Mutex<PendingCarQueue>> {
        async fn insert(
            &self,
            request: Request<proto::InsertRequest>,
        ) -> Result<tonic::Response<proto::CommandReply>, Status> {
            let proto::InsertRequest { item, position } = request.get_ref();

            let item = item.as_ref().ok_or(Status::invalid_argument(
                "InsertRequest property item is required!",
            ))?;

            self.lock()
                .await
                .insert(
                    item.meta.clone(),
                    position.map(|position| position as usize),
                )
                .map_err(|e| Status::failed_precondition(e.to_string()))?;

            Ok(tonic::Response::new(proto::CommandReply {}))
        }

        async fn remove(
            &self,
            request: Request<proto::RemoveRequest>,
        ) -> Result<tonic::Response<proto::CommandReply>, Status> {
            let proto::RemoveRequest { id } = request.get_ref();

            self.lock()
                .await
                .remove(id)
                .map_err(|e| Status::failed_precondition(e.to_string()))?;

            Ok(tonic::Response::new(proto::CommandReply {}))
        }

        async fn update(
            &self,
            request: Request<proto::UpdateRequest>,
        ) -> Result<tonic::Response<proto::CommandReply>, Status> {
            let proto::UpdateRequest { item } = request.get_ref();

            let item = item.as_ref().ok_or(Status::invalid_argument(
                "InsertRequest property item is required!",
            ))?;

            self.lock()
                .await
                .update(&item.id, item.meta.clone())
                .map_err(|e| Status::failed_precondition(e.to_string()))?;

            Ok(tonic::Response::new(proto::CommandReply {}))
        }

        async fn insert_many(
            &self,
            request: Request<proto::InsertManyRequest>,
        ) -> Result<tonic::Response<proto::CommandReply>, Status> {
            let proto::InsertManyRequest { item, position } = request.get_ref();

            self.lock()
                .await
                .insert_many(
                    item.iter().map(|item| item.meta.clone()),
                    position.map(|pos| pos as usize),
                )
                .map_err(|e| Status::failed_precondition(e.to_string()))?;

            Ok(tonic::Response::new(proto::CommandReply {}))
        }

        async fn remove_all(
            &self,
            _request: Request<proto::RemoveAllRequest>,
        ) -> Result<tonic::Response<proto::CommandReply>, Status> {
            self.lock()
                .await
                .remove_all()
                .map_err(|e| Status::failed_precondition(e.to_string()))?;

            Ok(tonic::Response::new(proto::CommandReply {}))
        }

        async fn replace_all(
            &self,
            request: Request<proto::ReplaceAllRequest>,
        ) -> Result<tonic::Response<proto::CommandReply>, Status> {
            let proto::ReplaceAllRequest { item } = request.get_ref();

            self.lock()
                .await
                .replace(item.iter().map(|item| item.meta.clone()))
                .map_err(|e| Status::failed_precondition(e.to_string()))?;

            Ok(tonic::Response::new(proto::CommandReply {}))
        }

        async fn read_all(
            &self,
            _request: Request<proto::ReadAllRequest>,
        ) -> Result<tonic::Response<proto::ReadAllReply>, Status> {
            Ok(tonic::Response::new(proto::ReadAllReply {
                item: self
                    .lock()
                    .await
                    .queue
                    .iter()
                    .map(|item| proto::InsertedItem {
                        id: item.id.clone(),
                        meta: item.meta.clone(),
                    })
                    .collect(),
            }))
        }

        type SubscribeChangeStream =
            Pin<Box<dyn Stream<Item = Result<proto::ReadAllReply, Status>> + Send>>;

        async fn subscribe_change(
            &self,
            _request: Request<proto::SubscribeChangeRequest>,
        ) -> Result<tonic::Response<Self::SubscribeChangeStream>, Status> {
            let (tx, rx) = tokio::sync::mpsc::channel(1);
            let mut watcher = self.lock().await.watcher.clone();
            tokio::spawn(async move {
                trace!("Change receiver spawned");
                while watcher.changed().await.is_ok() {
                    trace!("change received!");
                    let records = watcher.borrow().clone();

                    match tx
                        .send(Result::<_, Status>::Ok(ReadAllReply {
                            item: records
                                .iter()
                                .map(|item| proto::InsertedItem {
                                    id: item.id.clone(),
                                    meta: item.meta.clone(),
                                })
                                .collect(),
                        }))
                        .await
                    {
                        Ok(_) => {}
                        Err(_item) => {
                            break;
                        }
                    }
                }
                trace!("Change receiver closed");
            });

            let out_stream = tokio_stream::wrappers::ReceiverStream::new(rx);

            Ok(tonic::Response::new(
                Box::pin(out_stream) as Self::SubscribeChangeStream
            ))
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::{
        config::{self, Config, RecordMetadata},
        pending_car_queue::PendingCarQueue,
        running_observer::NextCarQueue,
    };

    fn setup() -> (PendingCarQueue,) {
        let config = Config {
            record: config::Record {
                metadata: RecordMetadata {
                    schema: serde_json::from_str(&r#"{"type": "string"}"#).unwrap(),
                    default: serde_json::from_str(&r#""default_metadata""#).unwrap(),
                },
            },
            ..Config::default()
        };

        (PendingCarQueue::new(&config),)
    }

    #[tokio::test]
    async fn works_when_added() {
        let mut queue = setup().0;

        queue.insert("0".to_string(), None).unwrap();
        queue.insert("1".to_string(), Some(1)).unwrap();

        assert_eq!(queue.consume_next_car().await.unwrap(), "0".to_string());
        assert_eq!(queue.consume_next_car().await.unwrap(), "1".to_string());
    }

    #[tokio::test]
    async fn error_when_added_with_too_large_index() {
        let mut queue = setup().0;

        queue.insert("10".to_string(), Some(1)).unwrap_err();
    }

    #[tokio::test]
    async fn works_when_removed() {
        let mut queue = setup().0;

        queue.insert("0".to_string(), None).unwrap();
        queue.insert("1".to_string(), Some(1)).unwrap();

        let id0 = queue.queue[0].id.clone();
        let id1 = queue.queue[1].id.clone();

        queue.remove(&id0).unwrap();
        queue.remove(&id1).unwrap();
    }

    #[tokio::test]
    async fn error_when_removed_with_unknown_index() {
        let mut queue = setup().0;

        queue.insert("10".to_string(), None).unwrap();

        queue.remove(&"invalid_id").unwrap_err();
    }
}
