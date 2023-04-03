use serde::Deserialize;

#[derive(Deserialize, Default)]
pub struct RecordMetadata {
  pub schema: serde_json::Value,
  pub default: serde_json::Value
}

#[derive(Deserialize, Default)]
pub struct Record {
  pub metadata: RecordMetadata
}

#[derive(Deserialize, Default)]
pub struct Server {
  pub addr: String
}

#[derive(Deserialize, Default)]
pub struct Config {
  pub record: Record,
  pub server: Server
}
