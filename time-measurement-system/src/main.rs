use std::{future::pending, sync::Arc, io::BufReader};
use serde::Deserialize;
use tokio::{sync::Mutex, fs::read_to_string};
use clap::{Parser, command, arg};

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

    let mut pending_car_queue = Arc::new(Mutex::new(pending_car_queue::PendingCarQueue::new()));
    let mut records = Arc::new(Mutex::new(records::Records::new(&config)));
    let mut observer = running_observer::RunningObserver::new(
        &config,
        pending_car_queue,
        records
    );

    observer.start(0).await.unwrap();
    observer.stop(0, &None).await.unwrap();

    println!("Hello, world!");
}
