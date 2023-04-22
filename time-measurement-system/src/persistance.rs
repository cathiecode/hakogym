use std::{
    fs::File,
    io::{BufReader, BufWriter, Write},
    sync::Arc,
};

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

use crate::{
    pending_car_queue::{PendingCar, PendingCarQueue},
    records::{Record, Records},
    running_observer::{RunningCar, RunningObserver},
};

pub struct FilePersistance {
    pending_car_queue: Arc<Mutex<PendingCarQueue>>,
    running_observer: Arc<Mutex<RunningObserver>>,
    records: Arc<Mutex<Records>>,
}

#[derive(Serialize, Deserialize)]
pub struct SaveFile {
    pending_cars: Vec<PendingCar>,
    running_cars: Vec<RunningCar>,
    record: Vec<Record>,
}

impl FilePersistance {
    pub fn new(
        pending_car_queue: Arc<Mutex<PendingCarQueue>>,
        running_observer: Arc<Mutex<RunningObserver>>,
        records: Arc<Mutex<Records>>,
    ) -> Self {
        Self {
            pending_car_queue,
            running_observer,
            records,
        }
    }

    pub async fn save(&self, file_name: &str) -> Result<()> {
        let pending_cars = self.pending_car_queue.lock().await.read().clone();
        let running_cars = self.running_observer.lock().await.read().clone();
        let record = self.records.lock().await.read().clone();

        let value = SaveFile {
            pending_cars,
            running_cars,
            record,
        };

        let mut writer = BufWriter::new(
            File::create(file_name).map_err(|e| anyhow!("File open failed due to {:?}", e))?,
        );

        serde_json::to_writer(&mut writer, &value)
            .map_err(|e| anyhow!("Failed to save file due to {:?}", e))?;

        writer
            .flush()
            .map_err(|e| anyhow!("Failed to write file due to {:?}", e))?;

        Ok(())
    }

    pub async fn load(&self, file_name: &str) -> Result<()> {
        let reader = BufReader::new(
            File::open(file_name).map_err(|e| anyhow!("File open failed due to {:?}", e))?,
        );

        let saved_file = serde_json::from_reader::<BufReader<File>, SaveFile>(reader)?;

        self.pending_car_queue
            .lock()
            .await
            .replace(saved_file.pending_cars.iter().map(|i| i.meta().clone()))?;
        self.records.lock().await.replace(saved_file.record);
        self.running_observer
            .lock()
            .await
            .replace(saved_file.running_cars);

        Ok(())
    }
}

pub mod server {
    use std::sync::Arc;

    use async_trait::async_trait;
    use tokio::sync::Mutex;
    use tonic::{Request, Response, Status};

    use crate::proto::{
        self,
        file_persistance::{CommandReply, LoadRequest, SaveRequest},
    };

    use super::FilePersistance;

    #[async_trait]
    impl proto::file_persistance::file_persistance_server::FilePersistance
        for Arc<Mutex<FilePersistance>>
    {
        async fn save(
            &self,
            request: Request<SaveRequest>,
        ) -> Result<Response<CommandReply>, Status> {
            self.lock()
                .await
                .save(&request.get_ref().file)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

                Ok(Response::new(CommandReply {}))
        }

        async fn load(
            &self,
            request: Request<LoadRequest>,
        ) -> Result<Response<CommandReply>, Status> {
            self.lock()
                .await
                .load(&request.get_ref().file)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

            Ok(Response::new(CommandReply {}))
        }
    }
}
