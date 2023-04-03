fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("../proto/records.proto").unwrap();
    tonic_build::compile_protos("../proto/pending_car_queue.proto").unwrap();
    tonic_build::compile_protos("../proto/running_observer.proto").unwrap();

    Ok(())
}
