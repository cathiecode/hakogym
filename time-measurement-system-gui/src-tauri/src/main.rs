// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_com_list])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
