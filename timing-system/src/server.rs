use std::collections::HashMap;
use std::sync::{Mutex, Arc, RwLock};

use anyhow::Result;
use tonic::{transport::Server, Request, Response, Status};

use crate::TimingSystemApp;
use crate::server::proto::timing_system_server::{TimingSystem, TimingSystemServer};

pub mod proto {
    tonic::include_proto!("timingsystem");

    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("descriptor");
}

pub struct TimingSystemAppController {
    competition: TimingSystemApp,
}

impl TimingSystemAppController {
    fn new() -> Self {
        Self {
            competition: TimingSystemApp { competition: None }
        }
    }
}

#[tonic::async_trait]
impl TimingSystem for TimingSystemAppController {
    async fn create_competition(&self, _: Request<proto::CreateCompetitionRequest>) -> Result<Response<proto::CommandReply>, Status> {
        todo!()
    }
    async fn register_next_car(&self, _: Request<proto::RegisterNextCarRequest>) -> Result<Response<proto::CommandReply>, Status> {
        todo!()
    }
    async fn get_registered_next_car(&self, _: Request<proto::GetRegisteredNextCarRequest>) -> Result<Response<proto::GetRegisteredNextCarReply>, Status> {
        todo!()
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
            .unwrap()
        )
        .serve(addr)
        .await?;
    Ok(())
}
