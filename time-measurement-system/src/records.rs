use anyhow::anyhow;
use anyhow::bail;
use anyhow::Result;
use async_trait::async_trait;
use jsonschema::JSONSchema;
use log::{error, debug, trace};
use nanoid::nanoid;

use crate::Config;
use crate::prelude::*;
use crate::running_observer;

#[derive(Clone, Debug)]
struct Record {
    pub record_id: String,
    pub duration: Duration,
    meta: String,
}

pub struct Records {
    records: Vec<Record>,
    meta_schema: JSONSchema
}

impl Records {
    pub fn new(config: &Config) -> Self {
        Self {
            records: Vec::new(),
            meta_schema: JSONSchema::compile(&config.record.metadata.schema).unwrap_or_else(|e| panic!("Invalid metadata schema!"))
        }
    }

    pub fn add(&mut self, duration: &Duration, meta: &String) -> Result<()> {
        let record = Record {
            record_id: nanoid!(),
            duration: duration.clone(),
            meta: meta.clone(),
        };

        self.validate_record(&record)?;

        debug!("An Record added. ({:?})", record);

        self.records.push(record);
        Ok(())
    }

    pub fn change(&mut self, new_record: Record) -> Result<()> {
        if let Some(index) = self.find_record_index(&new_record) {
            self.validate_record(&new_record)?;
            self.records[index] = new_record;
            Ok(())
        } else {
            bail!(
                "Specified record {:?} was not found.",
                new_record.record_id
            );
        }
    }

    // NOTE: 論理削除を検討
    pub fn remove(&mut self, record: Record) -> Result<()> {
        if let Some(index) = self.find_record_index(&record) {
            self.records.remove(index);
            Ok(())
        } else {
            bail!("Specified record {:?} was not found", record.record_id);
        }
    }

    fn validate_record(&mut self, record: &Record) -> Result<()> {
        self.meta_schema.validate(&serde_json::from_str::<serde_json::Value>(&record.meta)?).map_err(|_| anyhow!("Metadata validation failed."))?;
        Ok(())
    }

    fn find_record_index(&self, record: &Record) -> Option<usize> {
        self.records
            .iter()
            .position(|record| record.record_id == record.record_id)
    }
}

#[async_trait]
impl running_observer::RecordService for Records {
    async fn record(&mut self, record: running_observer::Record) {
        trace!("An record received via internal interface. ({:?})", &record);
        if let Err(error) = self.add(&record.duration, &record.meta) {
            error!("Failed to insert a record. ({:?})", &record);
        }
    }
}

#[cfg(test)]
mod tests {
    struct RecordServiceMock {

    }
}
