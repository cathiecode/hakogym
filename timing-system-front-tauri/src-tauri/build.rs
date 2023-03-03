fn main() -> Result<(), Box<dyn std::error::Error>> {
    let descriptor_path =
        std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap()).join("descriptor.bin");
    tonic_build::configure()
        .file_descriptor_set_path(&descriptor_path)
        .compile(&["../../resources/proto/timing-system.proto"], &["../../resources/proto/"])?;
    tauri_build::build();

    Ok(())
}
