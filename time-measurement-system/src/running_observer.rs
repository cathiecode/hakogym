use std::{sync::Arc};
use log::{debug, trace};
use tokio::sync::Mutex;

use anyhow::{anyhow, Result, bail};
use async_trait::async_trait;

use crate::prelude::*;

struct RunningCar {
    car_id: Option<CarId>,
    start_at: TimeStamp,
}

#[async_trait]
pub trait NextCarQueue {
    async fn consume_next_car(&mut self) -> Option<CarId>;
}

#[derive(Clone, Debug)]
pub struct Record {
    pub car_id: Option<CarId>,
    pub duration: Duration,
    pub meta: String
}

#[async_trait]
pub trait RecordService {
    async fn record(&mut self, record: Record);
}

pub struct RunningObserver {
    next_car_queue: Arc<Mutex<dyn NextCarQueue>>,
    record_service: Arc<Mutex<dyn RecordService>>,
    running_car: Vec<RunningCar>,
}

impl RunningObserver {
    pub fn new(
        next_car_queue: Arc<Mutex<dyn NextCarQueue>>,
        record_service: Arc<Mutex<dyn RecordService>>,
    ) -> RunningObserver {
        RunningObserver {
            next_car_queue,
            running_car: Vec::new(),
            record_service,
        }
    }

    pub async fn start(&mut self, timestamp: TimeStamp) -> Result<()> {
        debug!("Running start at {:?}", timestamp);
        let next_car_id = self.next_car_queue.lock().await.consume_next_car().await;

        self.running_car.push(RunningCar {
            car_id: next_car_id,
            start_at: timestamp,
        });

        Ok(())
    }

    pub async fn stop(&mut self, timestamp: TimeStamp, car_id: Option<CarId>) -> Result<()> {
        trace!("Stop requested at {:?} and car_id was {:?}", timestamp, car_id);

        if self.running_car.len() == 0 {
            bail!("No one running");
        }

        let car_to_stop = match car_id {
            Some(car_id) => self.find_car_index(&car_id)?,
            None => 0,
        };

        debug!("Running stopped at {:?} and index {:?} was now stopped", timestamp, car_to_stop);

        let stopped_car = self.running_car.remove(car_to_stop);

        let duration: Duration = timestamp - stopped_car.start_at;

        self.record_service
            .lock()
            .await
            .record(Record {
                car_id: stopped_car.car_id,
                duration: duration,
                meta: "".to_string() // TODO
            })
            .await;

        trace!("Done stop process.");

        Ok(())
    }

    pub async fn flip_start_or_stop(&mut self, timestamp: TimeStamp) -> Result<()> {
        trace!("Flipping start and stop");
        if self.running_car.len() == 0 {
            debug!("Nobody running so starting.");
            self.start(timestamp).await?;
            Ok(())
        } else {
            debug!("Someone running so stopping.");
            self.stop(timestamp, None).await?;
            Ok(())
        }
    }

    fn find_car_index(&mut self, car_id: &CarId) -> Result<usize> {
        if let Some(index) = self.running_car.iter().position(|car| {
            car.car_id
                .as_ref()
                .map_or(false, |unwrapped_car_id| unwrapped_car_id == car_id)
        }) {
            Ok(index)
        } else {
            Err(anyhow!("No such car {}", car_id))
        }
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use async_trait::async_trait;
    use tokio::sync::Mutex;

    use crate::prelude::*;
    use crate::running_observer::*;

    struct NextCarQueueMock {
        counter: i64,
    }

    struct EmptyNextCarQueueMock;

    struct RecordServiceMock {
        record_lines: Vec<Record>,
    }

    #[async_trait]
    impl RecordService for RecordServiceMock {
        async fn record(&mut self, record: Record) {
            self.record_lines.push(record);
        }
    }

    #[async_trait]
    impl NextCarQueue for NextCarQueueMock {
        async fn consume_next_car(&mut self) -> Option<CarId> {
            let next = self.counter;
            self.counter += 1;
            Some(format!("{}", next))
        }
    }

    #[async_trait]
    impl NextCarQueue for EmptyNextCarQueueMock {
        async fn consume_next_car(&mut self) -> Option<CarId> {
            None
        }
    }

    fn setup() -> (
        RunningObserver,
        Arc<Mutex<NextCarQueueMock>>,
        Arc<Mutex<RecordServiceMock>>,
    ) {
        let next_car_queue = Arc::new(Mutex::new(NextCarQueueMock { counter: 0 }));
        let record_service = Arc::new(Mutex::new(RecordServiceMock {
            record_lines: Vec::new(),
        }));

        let a = next_car_queue.clone();
        let b = record_service.clone();
        (RunningObserver::new(next_car_queue, record_service), a, b)
    }

    fn setup_empty_queue() -> (
        RunningObserver,
        Arc<Mutex<EmptyNextCarQueueMock>>,
        Arc<Mutex<RecordServiceMock>>,
    ) {
        let next_car_queue = Arc::new(Mutex::new(EmptyNextCarQueueMock));
        let record_service = Arc::new(Mutex::new(RecordServiceMock {
            record_lines: Vec::new(),
        }));

        let a = next_car_queue.clone();
        let b = record_service.clone();
        (RunningObserver::new(next_car_queue, record_service), a, b)
    }

    #[tokio::test]
    async fn works_when_stopped_with_car_id_not_specified() {
        let mut observer = setup();

        observer.0.start(0).await.unwrap();
        observer.0.stop(10, None).await.unwrap();

        let record = observer.2.lock().await.record_lines.get(0).unwrap().clone();
        assert_eq!(record.car_id, Some("0".to_string()));
        assert_eq!(record.duration, 10);
    }

    #[tokio::test]
    async fn works_when_stopped_with_car_id_specified() {
        let mut observer = setup();

        observer.0.start(0).await.unwrap();
        observer.0.stop(10, Some("0".to_string())).await.unwrap();

        let record = observer.2.lock().await.record_lines.get(0).unwrap().clone();
        assert_eq!(record.car_id, Some("0".to_string()));
        assert_eq!(record.duration, 10);
    }

    #[tokio::test]
    #[should_panic]
    async fn fails_when_stopped_with_car_id_did_not_started_specified() {
        let mut observer = setup();

        observer.0.start(0).await.unwrap();
        observer.0.stop(10, Some("unused_id".to_string())).await.unwrap();
    }

    #[tokio::test]
    async fn works_when_multi_cars_started() {
        let mut observer = setup();

        observer.0.start(0).await.unwrap();
        observer.0.start(10).await.unwrap();
        observer.0.stop(20, None).await.unwrap();
        observer.0.stop(40, None).await.unwrap();

        let record0 = observer.2.lock().await.record_lines.get(0).unwrap().clone();
        let record1 = observer.2.lock().await.record_lines.get(1).unwrap().clone();
        assert_eq!(record0.car_id, Some("0".to_string()));
        assert_eq!(record0.duration, 20);
        assert_eq!(record1.car_id, Some("1".to_string()));
        assert_eq!(record1.duration, 30);
    }

    #[tokio::test]
    async fn works_when_flip_start_or_stop_used() {
        let mut observer = setup();

        observer.0.flip_start_or_stop(0).await.unwrap();
        observer.0.flip_start_or_stop(10).await.unwrap();

        let record = observer.2.lock().await.record_lines.get(0).unwrap().clone();
        assert_eq!(record.car_id, Some("0".to_string()));
        assert_eq!(record.duration, 10);
    }

    #[tokio::test]
    async fn works_when_empty_queue_used() {
        let mut observer = setup_empty_queue();

        observer.0.start(0).await.unwrap();
        observer.0.stop(10, None).await.unwrap();

        let record = observer.2.lock().await.record_lines.get(0).unwrap().clone();
        assert_eq!(record.car_id, None);
        assert_eq!(record.duration, 10);
    }
}
