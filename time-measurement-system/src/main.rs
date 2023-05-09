use std::sync::Arc;

use clap::{arg, command, Parser};
use tokio::{fs::read_to_string, sync::Mutex};
use tonic_web;

use crate::config::Config;

mod prelude {
    pub type TimeStamp = i64;
    pub type Duration = i64;
    pub type MetaData = String;
    pub type RunningCarId = String;
}

mod aggrigated_change_broadcaster;
mod config;
mod pending_car_queue;
mod proto;
mod records;
mod running_observer;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(long)]
    config: String,
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let args = Args::parse();

    let config_string = read_to_string(args.config)
        .await
        .unwrap_or_else(|error| panic!("Failed to load config! {:?}", error));

    let config = serde_json::from_str::<Config>(&config_string)
        .unwrap_or_else(|error| panic!("Invalid config data! {:?}", error));

    let pending_car_queue = Arc::new(Mutex::new(pending_car_queue::PendingCarQueue::new(&config)));
    let records = Arc::new(Mutex::new(records::Records::new(&config)));
    let observer = Arc::new(Mutex::new(running_observer::RunningObserver::new(
        &config,
        pending_car_queue.clone(),
        records.clone(),
    )));

    let aggrigated_change_broadcaster = Arc::new(Mutex::new(
        aggrigated_change_broadcaster::AggrigatedChangeBroadcaster::new(
            observer.clone(),
            pending_car_queue.clone(),
            records.clone(),
        ).await,
    ));

    tonic::transport::Server::builder()
        .accept_http1(true)
        .add_service(tonic_web::enable(proto::running_observer::running_observer_server::RunningObserverServer::new(observer)))
        .add_service(tonic_web::enable(proto::pending_car_queue::pending_car_queue_server::PendingCarQueueServer::new(pending_car_queue)))
        .add_service(tonic_web::enable(proto::records::records_server::RecordsServer::new(records)))
        .add_service(tonic_web::enable(proto::aggrigated_change_broadcaster::aggrigated_change_broadcaster_server::AggrigatedChangeBroadcasterServer::new(aggrigated_change_broadcaster)))
        .serve(config.server.addr.parse().unwrap()).await.unwrap();
}
