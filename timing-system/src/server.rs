use log::trace;
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

use anyhow::Result;
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::Stream;
use tonic::{transport::Server, Request, Response, Status};

use crate::server::proto::timing_system_server::{TimingSystem, TimingSystemServer};
use crate::{
    CompetitionConfigurationId, CompetitionConfigurationTrack, CompetitionEntryId,
    MockCompetitionConfigurationRepository, MockCompetitionResultRepository, TimingSystemApp,
};

use self::proto::{
    CommandReply, GetCurrentTracksReply, GetRegisteredNextCarReply, GetRunningCarsResponse,
    SubscribeStateChangeReply,
};

pub mod proto {
    tonic::include_proto!("timingsystem");

    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("descriptor");
}

pub struct TimingSystemAppController {
    competition: Arc<Mutex<TimingSystemApp>>,
    change_watcher_sender: tokio::sync::watch::Sender<()>,
    change_watcher_receiver: tokio::sync::watch::Receiver<()>,
}

impl TimingSystemAppController {
    fn new() -> Self {
        let (change_watcher_sender, change_watcher_receiver) = tokio::sync::watch::channel(());
        Self {
            competition: Arc::new(Mutex::new(TimingSystemApp {
                competition: None,
                competition_configuration_repository: Arc::new(Mutex::new(
                    MockCompetitionConfigurationRepository(crate::CompetitionConfiguration {
                        tracks: {
                            let mut map = HashMap::new();
                            map.insert(
                                "0".to_owned(),
                                CompetitionConfigurationTrack { overlap_limit: 2 },
                            );
                            map
                        },
                    }),
                )),
            })),
            change_watcher_sender,
            change_watcher_receiver,
        }
    }
}

impl TimingSystemAppController {
    async fn notify_change(&self) -> Result<(), Status> {
        self.change_watcher_sender
            .send(())
            .map_err(|_| Status::internal("Internal error (subscription send)"))?;
        println!("change sent!");
        Ok(())
    }
}

#[tonic::async_trait]
impl TimingSystem for TimingSystemAppController {
    async fn create_competition(
        &self,
        request: Request<proto::CreateCompetitionRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .create_competition(CompetitionConfigurationId::new(
                &params.competition_configuration_id,
            ))
            .await
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn register_next_car(
        &self,
        request: Request<proto::RegisterNextCarRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        self.competition
            .lock()
            .await
            .register_next_car(0, &request.get_ref().track_id, &request.get_ref().car_id)
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn start(
        &self,
        request: Request<proto::StartRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .start(params.timestamp, &params.track_id)
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn stop(
        &self,
        request: Request<proto::StopRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .stop(
                params.timestamp,
                &params.track_id,
                params
                    .car_id
                    .as_ref()
                    .map(|id| CompetitionEntryId::new(id.as_str()))
                    .as_ref(),
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn red_flag(
        &self,
        request: Request<proto::RedFlagRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .red_flag(params.timestamp, &params.track_id)
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn mark_dnf(
        &self,
        request: Request<proto::RunnningCarSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .did_not_finished(
                params.timestamp,
                params.track_id.as_str(),
                params.car_id.as_str(),
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn mark_miss_course(
        &self,
        request: Request<proto::RunnningCarSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .miss_course(
                params.timestamp,
                params.track_id.as_str(),
                params.car_id.as_str(),
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn mark_pylon_touch(
        &self,
        request: Request<proto::RunnningCarSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .mark_pylon_touch(
                params.timestamp,
                params.track_id.as_str(),
                params.car_id.as_str(),
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn remove_pylon_touch(
        &self,
        request: Request<proto::RunnningCarSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .remove_pylon_touch(
                params.timestamp,
                params.track_id.as_str(),
                params.car_id.as_str(),
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn mark_derailment(
        &self,
        request: Request<proto::RunnningCarSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .add_derailment_count(
                params.timestamp,
                params.track_id.as_str(),
                params.car_id.as_str(),
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn remove_derailment(
        &self,
        request: Request<proto::RunnningCarSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .remove_derailment_count(
                params.timestamp,
                params.track_id.as_str(),
                params.car_id.as_str(),
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn mark_dnf_to_record(
        &self,
        request: Request<proto::RecordSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .mark_dnf_to_record(params.timestamp, params.record_id.as_str())
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn mark_miss_course_to_record(
        &self,
        request: Request<proto::RecordSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .mark_miss_course_to_record(params.timestamp, params.record_id.as_str())
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn remove_record(
        &self,
        request: Request<proto::RecordSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .remove_record(params.timestamp, params.record_id.as_str())
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn recovery_record(
        &self,
        request: Request<proto::RecordSpecificRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .recovery_record(params.timestamp, params.record_id.as_str())
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn change_record_pylon_touch_count(
        &self,
        request: Request<proto::ChangeRecordPylonTouchCountRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .change_record_pylon_touch_count(
                params.timestamp,
                params.record_id.as_str(),
                params.count,
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn change_record_derailment_count(
        &self,
        request: Request<proto::ChangeRecordDerailmentCountRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        self.competition
            .lock()
            .await
            .change_derailment_count_of_record(
                params.timestamp,
                params.record_id.as_str(),
                params.count,
            )
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        self.notify_change().await?;
        Ok(Response::new(CommandReply {}))
    }

    async fn get_registered_next_car(
        &self,
        request: Request<proto::GetRegisteredNextCarRequest>,
    ) -> Result<Response<proto::GetRegisteredNextCarReply>, Status> {
        let registered_next_car = self
            .competition
            .lock()
            .await
            .get_registered_next_car(&request.get_ref().track_id)
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        Ok(Response::new(GetRegisteredNextCarReply {
            car_id: registered_next_car,
        }))
    }

    async fn get_running_cars(
        &self,
        request: Request<proto::TrackSpecificRequest>,
    ) -> Result<Response<proto::GetRunningCarsResponse>, Status> {
        let params = request.get_ref();
        let running_cars = self
            .competition
            .lock()
            .await
            .get_running_cars(&params.track_id)
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        Ok(Response::new(GetRunningCarsResponse {
            car_id: running_cars,
        }))
    }

    async fn set_track_record_type(
        &self,
        request: Request<proto::SetTrackRecordTypeRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        let running_cars = self
            .competition
            .lock()
            .await
            .set_track_record_type(params.timestamp, &params.track_id, &params.record_type)
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        Ok(Response::new(CommandReply {}))
    }

    async fn change_record_type(
        &self,
        request: Request<proto::ChangeRecordTypeRequest>,
    ) -> Result<Response<proto::CommandReply>, Status> {
        let params = request.get_ref();
        let running_cars = self
            .competition
            .lock()
            .await
            .change_record_type(params.timestamp, &params.record_id, &params.record_type)
            .map_err(|e| Status::failed_precondition(e.to_string()))?;
        Ok(Response::new(CommandReply {}))
    }


    /*async fn get_results(
        &self,
        _: Request<proto::GetResultsRequest>,
    ) -> Result<Response<proto::GetResultsReply>, Status> {
        Ok(Response::new(proto::GetResultsReply {
            results: self
                .competition
                .lock()
                .await
                .get_results()
                .map_err(|e| Status::failed_precondition(e.to_string()))?
                .iter()
                .map(|result| proto::TimeResult {
                    car_id: result.get_competition_entry_id().get().to_owned(),
                    time: result.get_duration().num_milliseconds().abs() as u64,
                })
                .collect(),
        }))
    }*/

    type SubscribeStateChangeStream =
        Pin<Box<dyn Stream<Item = Result<proto::SubscribeStateChangeReply, Status>> + Send>>;
    async fn subscribe_state_change(
        &self,
        _: Request<proto::SubscribeStateChangeRequest>,
    ) -> Result<Response<Self::SubscribeStateChangeStream>, Status> {
        let (tx, rx) = mpsc::channel(128);
        let competition = self.competition.clone();
        let mut receiver = self.change_watcher_receiver.clone();
        tokio::spawn(async move {
            while receiver.changed().await.is_ok() {
                println!("change received!");
                let state_tree = competition
                    .lock()
                    .await
                    .get_state_tree()
                    .unwrap_or("".to_owned());

                match tx
                    .send(Result::<_, Status>::Ok(SubscribeStateChangeReply {
                        state: state_tree,
                    }))
                    .await
                {
                    Ok(_) => {
                        // item (server response) was queued to be send to client
                    }
                    Err(_item) => {
                        // output_stream was build from rx and both are dropped
                        break;
                    }
                }
            }
        });

        let out_stream = ReceiverStream::new(rx);

        Ok(Response::new(
            Box::pin(out_stream) as Self::SubscribeStateChangeStream
        ))
    }

    async fn get_state_tree(
        &self,
        _: Request<proto::GetStateTreeRequest>,
    ) -> Result<Response<proto::GetStateTreeReply>, Status> {
        let state_tree = self
            .competition
            .lock()
            .await
            .get_state_tree()
            .map_err(|error| Status::internal(error.to_string()))?;
        println!("{}", state_tree);
        Ok(Response::new(proto::GetStateTreeReply {
            state: state_tree,
        }))
    }
}

pub async fn run() -> Result<()> {
    let addr = "[::1]:11001".parse()?;
    Server::builder()
        .add_service(TimingSystemServer::new(TimingSystemAppController::new()))
        .add_service(
            tonic_reflection::server::Builder::configure()
                .register_encoded_file_descriptor_set(proto::FILE_DESCRIPTOR_SET)
                .build()
                .unwrap(),
        )
        .serve(addr)
        .await?;
    Ok(())
}
