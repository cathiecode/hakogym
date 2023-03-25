#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use once_cell::sync::OnceCell;
use std::{
    path::Path,
    process::Command,
    sync::mpsc::{self, SyncSender},
    thread,
    time::Duration,
};
use tauri::{App, Manager};

struct AppGlobal {
    service_message_sender: SyncSender<ServiceEvent>,
}

#[tokio::main]
async fn main() {
    let path = std::env::current_dir().unwrap();
    println!("starting dir: {}", path.display());

    let (tx, rx) = mpsc::sync_channel(4);

    let app = tauri::Builder::default()
        .manage(AppGlobal {
            service_message_sender: tx,
        })
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
        .invoke_handler(tauri::generate_handler!(launch_request, get_com_list))
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, event| match event {
        _ => {}
    })
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct LaunchConfiguration {
    google_spreadsheet_id: String,
    com_port: String,
    google_spreadsheet_start_row: String
}

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
    message_channel_origin: &mpsc::SyncSender<ServiceEvent>,
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
fn get_com_list() -> Result<Vec<String>, ()> {
    tokio_serial::available_ports()
        .map(|ports| {
            ports
                .iter()
                .map(|item| item.port_name.to_string())
                .collect::<Vec<String>>()
        })
        .map_err(|_| ())
}

#[tauri::command]
fn launch_request(state: tauri::State<AppGlobal>, config: LaunchConfiguration) {
    launch(config, state.service_message_sender.clone());
}

fn launch(config: LaunchConfiguration, message_channel: mpsc::SyncSender<ServiceEvent>) {
    println!("launch");

    start_service(
        "Main",
        {
            let command = Command::new(Path::new(".").join("data").join("timing-system.exe"));
            command
        },
        &message_channel,
    );

    start_service(
        "Signal IO",
        {
            let mut command = Command::new(
                Path::new(".")
                    .join("data")
                    .join("timing-system-signal-io.exe"),
            );
            command.arg(config.com_port);
            command
        },
        &message_channel,
    );

    start_service(
        "GUI",
        {
            let command = Command::new(
                Path::new(".")
                    .join("data")
                    .join("timing-system-front-tauri.exe"),
            );
            command
        },
        &message_channel,
    );

    start_service(
        "TimeDisplay",
        {
            let command = Command::new(
                Path::new(".")
                    .join("data")
                    .join("timing-system-time-display.exe"),
            );
            command
        },
        &message_channel,
    );


    start_service(
        "Google Spreadsheet Exporter",
        {
            let mut command =
                Command::new(Path::new(".").join("data").join("node18").join("node.exe"));
            command
                .args([Path::new(".")
                    .join("data")
                    .join("timing-system-google-spreadsheet-exporter")
                    .join("main.js")])
                .arg(config.google_spreadsheet_id)
                .arg(config.google_spreadsheet_start_row);
            command
        },
        &message_channel,
    );

    start_service(
        "VLC Controller",
        {
            let mut command =
                Command::new(Path::new(".").join("data").join("node18").join("node.exe"));
            command.args([Path::new(".")
                .join("data")
                .join("timing-system-vlc-controller")
                .join("main.js")]);
            command
        },
        &message_channel,
    );
}
