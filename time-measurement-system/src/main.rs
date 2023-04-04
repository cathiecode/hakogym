use std::{sync::Arc};

use tokio::{sync::Mutex, fs::read_to_string};
use clap::{Parser, command, arg};
use tonic_web;

use crate::config::Config;

mod prelude {
    pub type TimeStamp = i64;
    pub type Duration = i64;
    pub type MetaData = String;
    pub type RunningCarId = String;
}

mod pending_car_queue;
mod records;
mod running_observer;
mod config;
mod proto;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(long)]
    config: String
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let args = Args::parse();

    let config_string = read_to_string(args.config).await.unwrap_or_else(|error| panic!("Failed to load config! {:?}", error));

    let config = serde_json::from_str::<Config>(&config_string).unwrap_or_else(|error| panic!("Invalid config data! {:?}", error));

    let pending_car_queue = Arc::new(Mutex::new(pending_car_queue::PendingCarQueue::new(&config)));
    let records = Arc::new(Mutex::new(records::Records::new(&config)));
    let observer = Arc::new(Mutex::new(running_observer::RunningObserver::new(
        &config,
        pending_car_queue.clone(),
        records.clone()
    )));

    tonic::transport::Server::builder()
        .accept_http1(true)
        .add_service(tonic_web::enable(proto::running_observer::running_observer_server::RunningObserverServer::new(observer)))
        .add_service(tonic_web::enable(proto::pending_car_queue::pending_car_queue_server::PendingCarQueueServer::new(pending_car_queue)))
        .add_service(tonic_web::enable(proto::records::records_server::RecordsServer::new(records)))
        .serve(config.server.addr.parse().unwrap()).await.unwrap();
}
