use anyhow::anyhow;
use anyhow::bail;
use anyhow::Result;
use async_trait::async_trait;
use jsonschema::JSONSchema;
use log::{debug, error, trace};
use nanoid::nanoid;

use crate::prelude::*;
use crate::running_observer;
use crate::Config;

#[derive(Clone, Debug)]
struct Record {
    pub record_id: String,
    pub duration: Duration,
    pub meta: String,
}

pub struct Records {
    records: Vec<Record>,
    meta_schema: JSONSchema,
    on_change: tokio::sync::watch::Sender<Vec<Record>>,
    watcher: tokio::sync::watch::Receiver<Vec<Record>>,
}

impl Records {
    pub fn new(config: &Config) -> Self {
        let records = Vec::new();
        let (on_change, watcher) = tokio::sync::watch::channel(records.clone());
        Self {
            records,
            meta_schema: JSONSchema::compile(&config.record.metadata.schema)
                .unwrap_or_else(|e| panic!("Invalid metadata schema! {:?}", e)),
            on_change,
            watcher,
        }
    }

    pub fn add(&mut self, duration: &Duration, meta: &str) -> Result<()> {
        let record = Record {
            record_id: nanoid!(),
            duration: duration.clone(),
            meta: meta.to_string(),
        };

        self.validate_record(&record)?;

        debug!("An Record added. ({:?})", record);

        self.records.push(record);

        self.promote_change();
        Ok(())
    }

    pub fn update(&mut self, record_id: &str, duration: Duration, meta: &str) -> Result<()> {
        let new_record = Record {
            record_id: record_id.to_string(),
            duration,
            meta: meta.to_string(),
        };
        if let Some(index) = self.find_record_index(&new_record.record_id) {
            self.validate_record(&new_record)?;
            self.records[index] = new_record;

            self.promote_change();
            Ok(())
        } else {
            bail!("Specified record {:?} was not found.", new_record.record_id);
        }
    }

    // NOTE: 論理削除を検討
    pub fn remove(&mut self, record_id: &str) -> Result<()> {
        if let Some(index) = self.find_record_index(&record_id) {
            self.records.remove(index);

            self.promote_change();
            Ok(())
        } else {
            bail!("Specified record {:?} was not found", record_id);
        }
    }

    pub fn remove_all(&mut self) -> Result<()> {
        self.records.clear();

        self.promote_change();
        Ok(())
    }

    fn promote_change(&self) {
        if let Err(error) = self.on_change.send(self.records.clone()) {
            error!("Failed to promote change. ({:?})", error);
        }
    }

    fn validate_record(&mut self, record: &Record) -> Result<()> {
        self.meta_schema
            .validate(&serde_json::from_str::<serde_json::Value>(&record.meta)?)
            .map_err(|_| anyhow!("Metadata validation failed."))?;
        Ok(())
    }

    fn find_record_index(&self, record_id: &str) -> Option<usize> {
        self.records
            .iter()
            .position(|record| record_id == record.record_id)
    }
}

pub mod server {
    use async_trait::async_trait;
    use log::trace;
    use std::{pin::Pin, sync::Arc};
    use tokio::sync::Mutex;
    use tokio_stream::Stream;
    use tonic::{Request, Status};

    use super::Records;
    use crate::proto::records::{self as proto, ReadAllReply};

    #[async_trait]
    impl proto::records_server::Records for Arc<Mutex<Records>> {
        type SubscribeChangeStream =
            Pin<Box<dyn Stream<Item = Result<proto::ReadAllReply, Status>> + Send>>;

        async fn insert(
            &self,
            request: Request<proto::InsertRequest>,
        ) -> Result<tonic::Response<proto::CommandReply>, Status> {
            let proto::InsertRequest { item } = request.get_ref();

            let item = item.as_ref().ok_or(Status::invalid_argument(
                "InsertRequest property item is required!",
            ))?;

            self.lock()
                .await
                .add(&item.time, &item.meta)
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
                .update(&item.id, item.time, &item.meta)
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

        async fn read_all(
            &self,
            _request: Request<proto::ReadAllRequest>,
        ) -> Result<tonic::Response<proto::ReadAllReply>, Status> {
            Ok(tonic::Response::new(proto::ReadAllReply {
                item: self
                    .lock()
                    .await
                    .records
                    .iter()
                    .map(|item| proto::InsertedItem {
                        id: item.record_id.clone(),
                        time: item.duration,
                        meta: item.meta.clone(),
                    })
                    .collect(),
            }))
        }

        async fn subscribe_change(
            &self,
            _request: Request<proto::SubscribeChangeRequest>,
        ) -> Result<tonic::Response<Self::SubscribeChangeStream>, Status> {
            let (tx, rx) = tokio::sync::mpsc::channel(1);
            let mut watcher = self.lock().await.watcher.clone();
            tokio::spawn(async move {
                while watcher.changed().await.is_ok() {
                    trace!("change received!");
                    let records = watcher.borrow().clone();

                    match tx
                        .send(Result::<_, Status>::Ok(ReadAllReply {
                            item: records
                                .iter()
                                .map(|item| proto::InsertedItem {
                                    id: item.record_id.clone(),
                                    time: item.duration,
                                    meta: item.meta.clone(),
                                })
                                .collect(),
                        }))
                        .await
                    {
                        Ok(_) => {},
                        Err(_item) => {
                            break;
                        }
                    }
                }
            });

            let out_stream = tokio_stream::wrappers::ReceiverStream::new(rx);

            Ok(tonic::Response::new(
                Box::pin(out_stream) as Self::SubscribeChangeStream
            ))
        }
    }
}

#[async_trait]
impl running_observer::RecordService for Records {
    async fn record(&mut self, record: running_observer::Record) {
        debug!("An record received via internal interface. ({:?})", &record);
        if let Err(error) = self.add(&record.duration, &record.meta) {
            error!(
                "Failed to insert a record ({:?}) due to {:?}",
                &record, error
            );
        }
    }
}

#[cfg(test)]
mod tests {}
