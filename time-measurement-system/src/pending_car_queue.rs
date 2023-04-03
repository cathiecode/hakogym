use anyhow::{anyhow, bail, Result};
use async_trait::async_trait;
use nanoid::nanoid;

use crate::prelude::*;

// TODO: validate metadata
struct PendingCar {
    id: String,
    meta: MetaData,
}

pub struct PendingCarQueue {
    queue: Vec<PendingCar>,
}

impl PendingCarQueue {
    pub fn new() -> Self {
        PendingCarQueue { queue: Vec::new() }
    }

    pub fn insert(&mut self, meta: MetaData, index: Option<usize>) -> Result<()> {
        let car = PendingCar {
            id: nanoid!(),
            meta,
        };

        if let Some(index) = index {
            if index > self.queue.len() {
                bail!("Index {} was too large", index);
            }

            self.queue.insert(index, car);
        } else {
            self.queue.push(car);
        }

        Ok(())
    }

    pub fn remove(&mut self, id: &str) -> Result<()> {
        let index = self.find_car_index(id)?;
        self.queue.remove(index);
        Ok(())
    }

    pub fn update(&mut self, id: &str, meta: String) -> Result<()> {
        let index = self.find_car_index(id)?;
        self.queue
            .get_mut(index)
            .ok_or(anyhow!("Logic Error"))?
            .meta = meta;
        Ok(())
    }

    pub fn insert_many(
        &mut self,
        metas: impl Iterator<Item = String>,
        position: Option<usize>,
    ) -> Result<()> {
        // TODO: validate metadata

        let position = position.unwrap_or(self.queue.len());

        if position > self.queue.len() {
            bail!("Index {} was too large", position);
        }

        self.queue.splice(
            &position..&position,
            metas
                .map(|meta| PendingCar {
                    id: nanoid!(),
                    meta,
                })
                .collect::<Vec<PendingCar>>(),
        );

        Ok(())
    }

    pub fn remove_all(&mut self) {
        self.queue.clear();
    }

    pub fn replace(&mut self, metas: impl Iterator<Item = String>) -> Result<()> {
        self.queue = metas.map(|meta| {PendingCar {id: nanoid!(), meta}}).collect::<Vec<PendingCar>>();
        Ok(())
    }

    fn find_car_index(&mut self, car_id: &str) -> Result<usize> {
        if let Some(index) = self.queue.iter().position(|car| &car.id == car_id) {
            Ok(index)
        } else {
            Err(anyhow!("No such car {}", car_id))
        }
    }
}

#[async_trait]
impl crate::running_observer::NextCarQueue for PendingCarQueue {
    async fn consume_next_car(&mut self) -> Option<MetaData> {
        if self.queue.len() == 0 {
            return None;
        }
        Some(self.queue.remove(0).meta)
    }
}

pub mod server {
    use async_trait::async_trait;
    use std::sync::Arc;
    use tokio::sync::Mutex;
    use tonic::{Request, Status};

    use super::{PendingCarQueue};
    use crate::proto::pending_car_queue as proto;

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
                .insert(item.meta.clone(), position.map(|position| position as usize))
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
            self.lock().await.remove_all();

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
    }
}

#[cfg(test)]
mod tests {
    use crate::{pending_car_queue::PendingCarQueue, running_observer::NextCarQueue};

    #[tokio::test]
    async fn works_when_added() {
        let mut queue = PendingCarQueue::new();

        queue.insert("0".to_string(), None).unwrap();
        queue.insert("1".to_string(), Some(1)).unwrap();

        assert_eq!(queue.consume_next_car().await.unwrap(), "0".to_string());
        assert_eq!(queue.consume_next_car().await.unwrap(), "1".to_string());
    }

    #[tokio::test]
    async fn error_when_added_with_too_large_index() {
        let mut queue = PendingCarQueue::new();

        queue.insert("10".to_string(), Some(1)).unwrap_err();
    }

    #[tokio::test]
    async fn works_when_removed() {
        let mut queue = PendingCarQueue::new();

        queue.insert("0".to_string(), None).unwrap();
        queue.insert("1".to_string(), Some(1)).unwrap();

        let id0 = queue.queue[0].id.clone();
        let id1 = queue.queue[1].id.clone();

        queue.remove(&id0).unwrap();
        queue.remove(&id1).unwrap();
    }

    #[tokio::test]
    async fn error_when_removed_with_unknown_index() {
        let mut queue = PendingCarQueue::new();

        queue.insert("10".to_string(), None).unwrap();

        queue.remove(&"invalid_id").unwrap_err();
    }
}
