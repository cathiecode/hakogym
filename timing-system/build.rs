fn main() -> Result<(), Box<dyn std::error::Error>> {
    /*tonic_build::compile_protos("../proto/timing-system.proto")?;*/
    let descriptor_path = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap()).join("descriptor.bin");
    tonic_build::configure()
    .file_descriptor_set_path(&descriptor_path)
    .compile(&["../proto/timing-system.proto"], &["../proto/"])?;

    Ok(())
}
