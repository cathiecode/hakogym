#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fmt::Debug, path::Path, process::Command, sync::mpsc, thread, time::Duration};
use tauri::Manager;

#[tokio::main]
async fn main() {
    let (tx, rx) = mpsc::channel();

    let path = std::env::current_dir().unwrap();
    println!("starting dir: {}", path.display());

    // launch(LaunchConfiguration {}, tx);

    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            tokio::spawn(async move {
                loop {
                    let message = rx.recv();

                    if let Ok(event) = message {
                        app_handle.emit_all("service_event", event);
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler!(
            launch
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

struct LaunchConfiguration {}

type Service = String;

#[derive(Clone, serde::Serialize)]
#[serde(tag = "type")]
enum ServiceEvent {
    Spawned { service: Service },
    Exited { service: Service },
    Message { service: Service, message: String },
}

fn start_service(
    name_orig: &str,
    mut command: Command,
    message_channel_origin: &mpsc::Sender<ServiceEvent>,
) {
    let message_channel = message_channel_origin.clone();
    let name = name_orig.to_string();

    println!("Service {:?} registrated.", command);

    thread::spawn(move || loop {
        message_channel.send(ServiceEvent::Spawned {
            service: name.to_string(),
        });
        let result = command.output();

        if let Ok(message) = result {
            message_channel.send(ServiceEvent::Message {
                service: name.to_string(),
                message: format!("{:?}", message),
            });
        } else if let Err(message) = result {
            message_channel.send(ServiceEvent::Message {
                service: name.to_string(),
                message: format!("{:?}", message),
            });
        }

        message_channel.send(ServiceEvent::Exited {
            service: name.to_string(),
        });
        thread::sleep(Duration::from_millis(1000));
    });
}

#[tauri::command]
fn launch(config: LaunchConfiguration, message_channel: mpsc::Sender<ServiceEvent>) {
    println!("launch");

    start_service(
        "Main",
        {
            let command = Command::new(Path::new(".").join("data").join("timing-system.exe"));
            command
        },
        &message_channel,
    );

    /*start_service(
        "GUI",
        {
            let command = Command::new(Path::new(".").join("data").join("timing-system-front.exe"));
            command
        },
        &message_channel,
    );

    start_service(
        "Google Spreadsheet Exporter",
        {
            let command = Command::new(Path::new(".").join("data").join("node18").join("node.exe"));
            command.args([Path::new(".").join("data").join("timing-system-google-spreadsheet-exporter")]);
            command
        },
        &message_channel
    )
    */
}

