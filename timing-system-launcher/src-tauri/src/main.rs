#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{process::Command, sync::mpsc, thread, time::Duration};

use tauri::Manager;

#[tokio::main]
async fn main() {
    let (tx, rx) = mpsc::channel();

    launch(LaunchConfiguration {}, tx);

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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

struct LaunchConfiguration {}

#[derive(Clone, serde::Serialize)]
enum Service {
    Test,
}

#[derive(Clone, serde::Serialize)]
#[serde(tag = "type")]
enum ServiceEvent {
    Spawned { service: Service },
    Exited { service: Service },
}

fn launch(config: LaunchConfiguration, message_channel: mpsc::Sender<ServiceEvent>) {
    println!("launch");
    thread::spawn(move || loop {
        message_channel.send(ServiceEvent::Spawned {
            service: Service::Test,
        });
        Command::new("sh").arg("-c").arg("sleep 1").output();
        message_channel.send(ServiceEvent::Exited {
            service: Service::Test,
        });
        thread::sleep(Duration::from_millis(1000));
    });
}
