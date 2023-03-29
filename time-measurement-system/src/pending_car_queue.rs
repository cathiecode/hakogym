use anyhow::{bail, Result};
use async_trait::async_trait;

use crate::prelude::*;

struct PendingCar {
    car_id: CarId,
}

pub struct PendingCarQueue {
    queue: Vec<PendingCar>,
}

impl PendingCarQueue {
    pub fn new() -> Self {
        PendingCarQueue { queue: Vec::new() }
    }

    pub fn insert(&mut self, index: usize, car_id: CarId) -> Result<()> {
        if index > self.queue.len() {
            bail!("Index {} was too large", index);
        }

        self.queue.insert(index, PendingCar { car_id });
        Ok(())
    }

    pub fn remove(&mut self, index: usize) -> Result<()> {
        if index >= self.queue.len() {
            bail!("Index {} was too large", index);
        }

        self.queue.remove(index);
        Ok(())
    }
}

#[async_trait]
impl crate::running_observer::NextCarQueue for PendingCarQueue {
    async fn consume_next_car(&mut self) -> Option<CarId> {
        if self.queue.len() == 0 {
            return None;
        }
        Some(self.queue.remove(0).car_id)
    }
}

#[cfg(test)]
mod tests {
    use crate::{pending_car_queue::PendingCarQueue, running_observer::NextCarQueue};

    #[tokio::test]
    async fn works_when_added() {
        let mut queue = PendingCarQueue::new();

        queue.insert(0, "0".to_string()).unwrap();
        queue.insert(1, "1".to_string()).unwrap();

        assert_eq!(queue.consume_next_car().await.unwrap(), "0".to_string());
        assert_eq!(queue.consume_next_car().await.unwrap(), "1".to_string());
    }

    #[tokio::test]
    async fn error_when_added_with_too_large_index() {
        let mut queue = PendingCarQueue::new();

        queue.insert(1, "10".to_string()).unwrap_err();
    }

    #[tokio::test]
    async fn works_when_removed() {
        let mut queue = PendingCarQueue::new();

        queue.insert(0, "0".to_string()).unwrap();
        queue.insert(1, "1".to_string()).unwrap();

        queue.remove(1).unwrap();
        queue.remove(0).unwrap();
    }

    #[tokio::test]
    async fn error_when_removed_with_too_large_index() {
        let mut queue = PendingCarQueue::new();

        queue.insert(0, "10".to_string()).unwrap();

        queue.remove(1).unwrap_err();
    }
}
