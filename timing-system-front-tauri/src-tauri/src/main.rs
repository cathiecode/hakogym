#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tonic::Request;

mod observer;

struct AppState {}

mod proto {
    tonic::include_proto!("timingsystem");
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

async fn get_connection(
) -> Result<proto::timing_system_client::TimingSystemClient<tonic::transport::Channel>, String> {
    println!("Creating connection...");
    Ok(
        proto::timing_system_client::TimingSystemClient::connect("http://[::1]:11001")
            .await
            .map_err(|error| "Connection Error!")?,
    )
}

fn get_current_timestamp() -> Result<u64, Box<dyn std::error::Error>> {
    Ok(std::time::SystemTime::now()
        .duration_since(std::time::SystemTime::UNIX_EPOCH)?
        .as_millis() as u64)
}

#[tauri::command]
async fn create_competition(configuration_id: &str) -> Result<(), String> {
    let mut connection = get_connection().await?;
    let request = proto::CreateCompetitionRequest {
        competition_configuration_id: configuration_id.to_string(),
        timestamp: get_current_timestamp().map_err(|error| "Connection Error!")?,
    };
    connection
        .create_competition(request)
        .await
        .map_err(|error| "Something went wrong!")?;
    Ok(())
}

#[tauri::command]
async fn register_next_car(timestamp: u64, car_id: String, track_id: String) -> Result<(), String> {
    let mut connection = get_connection().await?;
    let request = proto::RegisterNextCarRequest {
        timestamp,
        car_id,
        track_id,
    };
    connection
        .register_next_car(request)
        .await
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
async fn start(timestamp: u64, track_id: String) -> Result<(), String> {
    let mut connection = get_connection().await?;
    let request = proto::StartRequest {
        timestamp,
        track_id,
    };
    connection
        .start(request)
        .await
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
async fn stop(timestamp: u64, track_id: String, car_id: Option<String>) -> Result<(), String> {
    let mut connection = get_connection().await?;
    let request = proto::StopRequest {
        timestamp,
        track_id,
        car_id,
    };
    connection
        .stop(request)
        .await
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_current_tracks() -> Result<Vec<String>, String> {
    println!("Fetching competition...");
    let mut connection = get_connection().await?;
    let request = proto::GetCurrentTracksRequest {};
    let result = connection
        .get_current_tracks(request)
        .await
        .map_err(|error| "Failed to get tracks!")?;
    Ok(result.into_inner().track_id)
}

#[tauri::command]
async fn get_state_tree() -> Result<String, String> {
    let mut connection = get_connection().await?;
    let request = proto::GetStateTreeRequest {};
    let result = connection
        .get_state_tree(request)
        .await
        .map_err(|error| error.to_string())?;
    Ok(result.into_inner().state)
}

async fn subscribe_change<R>(manager: &impl Manager<R>) -> Result<(), Box<dyn std::error::Error>>
where
    R: tauri::Runtime,
{
    let mut connection =
        proto::timing_system_client::TimingSystemClient::connect("http://[::1]:11001").await?;

    let mut subscription = connection
        .subscribe_state_change(Request::new(proto::SubscribeStateChangeRequest {}))
        .await?
        .into_inner();

    println!("Connected. waiting for change...");

    while let Some(message) = subscription.message().await.ok() {
        println!("state changed.");
        let state = message.map_or("".to_owned(), |message| message.state);
        manager.emit_all("state_changed", state);
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
        .manage(AppState {})
        .setup(|app| {
            let app_handle = app.handle();
            tokio::spawn(async move {
                loop {
                    subscribe_change(&app_handle).await;
                    println!("Failed to connect for subscription. Retrying...");
                    std::thread::sleep(std::time::Duration::from_secs(3));
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler!(
            greet,
            create_competition,
            get_current_tracks,
            get_state_tree,
            register_next_car,
            start,
            stop
        ))
        .run(tauri::generate_context!())?;
    Ok(())
}
