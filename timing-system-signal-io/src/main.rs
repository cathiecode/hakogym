// 20230320時点で使用されている有線光電管ハードウェアに対応した光電管ドライバ

use bytes::BytesMut;
use futures::stream::StreamExt;
use proto::timing_system_client;
use std::{io, str};
use tokio_serial::SerialPortBuilderExt;
use tokio_util::codec::{Decoder, Encoder};
use tonic::transport::Channel;

mod proto {
    tonic::include_proto!("timingsystem");
}

fn get_unixtime_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64 // FIXME: High precision timer
}

async fn on_signal(
    mut client: proto::timing_system_client::TimingSystemClient<Channel>,
    timestamp_ms: u64,
) {
    println!("Signaling! timestamp: {}", timestamp_ms);
    let running_cars_response = client
        .get_running_cars(proto::TrackSpecificRequest {
            track_id: "0".to_string(),
        })
        .await
        .unwrap()
        .get_ref()
        .car_id
        .clone();

    println!("State received");

    // FIXME: 2台以上オーバーラップを考慮していない
    if running_cars_response.len() != 0 {
        client
            .stop(proto::StopRequest {
                timestamp: timestamp_ms,
                track_id: "0".to_string(),
                car_id: None,
            })
            .await
            .map_err(|e| println!("Start failed with error: {:?}", e))
            .err();
    } else {
        client
            .start(proto::StartRequest {
                timestamp: timestamp_ms,
                track_id: "0".to_string(),
            })
            .await
            .map_err(|e| println!("Start failed with error: {:?}", e))
            .err();
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

#[tokio::main]
async fn main() {
    let com_port = std::env::args().collect::<Vec<String>>()[1].clone();
    let serial = tokio_serial::new(com_port, 9600)
        .open_native_async()
        .expect("Failed to open serial io");

    // let mut serial_buf: [u8; 1] = [0];

    let client = timing_system_client::TimingSystemClient::connect("http://[::1]:11001")
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

    /*loop {
        let result = serial.read(&mut serial_buf);

        if let Err(error) = result {
            println!("Something went wrong!");
            abort()
        }

        if serial_buf[0] == '0' as u8 {
            let current_unixtime_ms = get_unixtime_ms();
            tokio::spawn(async move {
                on_signal(current_unixtime_ms).await;
            });
        }
    }*/
}
