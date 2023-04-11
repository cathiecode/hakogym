use clap::Parser;
use futures::stream::StreamExt;
use log::{debug, error};
use prost::bytes::BytesMut;
use serde::Deserialize;
use std::{io, str};
use tokio::fs::read_to_string;
use tokio_serial::SerialPortBuilderExt;
use tokio_util::codec::{Decoder, Encoder};
use tonic::transport::Channel;

use crate::proto::FlipRunningStateCommandRequest;

mod proto {
    tonic::include_proto!("has.runningobserver");
}

fn get_unixtime_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64 // FIXME: High precision timer
}

async fn on_signal(
    mut client: proto::running_observer_client::RunningObserverClient<Channel>,
    timestamp: i64,
) {
    debug!("Signaling! timestamp: {}", timestamp);
    if let Err(e) = client
        .flip_running_state(FlipRunningStateCommandRequest { timestamp })
        .await
    {
        error!("Failed to flip running state {:?}", e);
    }
}

struct LineCodec;

impl Decoder for LineCodec {
    type Item = String;
    type Error = io::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        let newline = src.as_ref().iter().position(|b| *b == b'\n');
        if let Some(n) = newline {
            let line = src.split_to(n + 1);
            return match str::from_utf8(line.as_ref()) {
                Ok(s) => Ok(Some(s.to_string())),
                Err(_) => Err(io::Error::new(io::ErrorKind::Other, "Invalid String")),
            };
        }
        Ok(None)
    }
}

impl Encoder<String> for LineCodec {
    type Error = io::Error;

    fn encode(&mut self, _item: String, _dst: &mut BytesMut) -> Result<(), Self::Error> {
        Ok(())
    }
}

#[derive(Deserialize, Default)]
pub struct Server {
    pub addr: String,
}

#[derive(Deserialize, Default)]
pub struct Config {
    pub server: Server,
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(long)]
    config: String,
    #[arg(long)]
    com: String,
    #[arg(long, default_value_t = 9600)]
    baud: u32,
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

    let serial = tokio_serial::new(args.com, args.baud)
        .open_native_async()
        .expect("Failed to open serial io");

    let client = proto::running_observer_client::RunningObserverClient::connect(config.server.addr)
        .await
        .unwrap();

    let mut reader = LineCodec.framed(serial);

    while let Some(line_result) = reader.next().await {
        let current_unixtime_ms = get_unixtime_ms();
        let line = line_result.expect("Failed to read line");

        if line.starts_with("0") {
            let client_cloned = client.clone();
            tokio::spawn(async move {
                on_signal(client_cloned, current_unixtime_ms).await;
            });
        }
    }
}
