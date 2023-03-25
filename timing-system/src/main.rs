mod server;

use std::{
    collections::{HashMap, VecDeque},
    mem::swap,
    sync::Arc,
    time,
};

use env_logger::fmt::Timestamp;
use serde_with::serde_as;
use tokio::sync::Mutex;

use anyhow::Result;

use async_trait::async_trait;
use chrono::{naive::serde::ts_milliseconds, TimeZone, Utc};
use serde::{
    ser::{SerializeStruct, SerializeStructVariant},
    Deserialize, Serialize,
};

use nanoid::nanoid;
use thiserror::Error;

use log::{debug, error, trace};

type Duration = time::Duration;
type TimeStamp = chrono::DateTime<chrono::Utc>;

trait Replayable {
    type Command;
    type CommandResult;
    fn command(&mut self, event: &Self::Command) -> Self::CommandResult;
}

/* Workaround for using sort(). will removed after implement sorting */
struct ReplayerLog<T, U> {
    insert_index: u32,
    last_result: U,
    command: T,
}

impl<T, U> PartialEq for ReplayerLog<T, U> {
    fn eq(&self, other: &Self) -> bool {
        self.insert_index == other.insert_index
    }
}

impl<T, U> Eq for ReplayerLog<T, U> {}

impl<T, U> PartialOrd for ReplayerLog<T, U> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.insert_index.partial_cmp(&other.insert_index)
    }
}

impl<T, U> Ord for ReplayerLog<T, U>
where
    T: PartialOrd,
{
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.command
            .partial_cmp(&other.command)
            .unwrap_or(self.insert_index.cmp(&other.insert_index))
    }
}

/* end of workaround */

struct Replayer<Model: Replayable, Factory> {
    entity: Model,
    commands: Vec<ReplayerLog<Model::Command, Model::CommandResult>>,
    factory: Factory,
    insert_index: u32,
}

impl<T: PartialOrd, Model: Replayable<Command = T>, Factory: Fn() -> Model>
    Replayer<Model, Factory>
{
    fn new(factory: Factory) -> Replayer<Model, Factory> {
        Replayer {
            entity: factory(),
            commands: Vec::new(),
            factory,
            insert_index: 0,
        }
    }

    fn from_commands(factory: Factory, commands: Vec<Model::Command>) -> Replayer<Model, Factory> {
        let mut replayer = Replayer {
            entity: factory(),
            commands: Vec::new(),
            factory,
            insert_index: 0,
        };

        for command in commands {
            replayer.insert(command);
        }

        replayer
    }

    pub fn command(&mut self, command: Model::Command) {
        self.insert(command)
    }

    pub fn get(&self) -> &Model {
        &self.entity
    }

    fn insert(&mut self, command: Model::Command) {
        // OPTIMIZE
        let command = ReplayerLog {
            last_result: self.entity.command(&command),
            command,
            insert_index: self.insert_index,
        };

        self.insert_index += 1;

        let is_last = self
            .commands
            .last()
            .map_or(true, |last_command| last_command < &command);

        if !is_last {
            self.commands.push(command);
            self.commands.sort();
            self.recalc();
        } else {
            self.commands.push(command);
        }
    }

    fn recalc(&mut self) {
        debug!("State recaliculation caused");
        self.entity = (self.factory)();
        for command in self.commands.iter() {
            self.entity.command(&command.command);
        }
    }
}

impl<Model: Replayable, T> AsRef<Model> for Replayer<Model, T> {
    fn as_ref(&self) -> &Model {
        &self.entity
    }
}

#[derive(Serialize)]
struct Timer {
    state: TimerState,
}

#[derive(Error, Debug)]
enum AppError {
    #[error("Timer already started")]
    TimerAlreadyStarted,
    #[error("Timer have not started")]
    TimerHaveNotStarted,
    #[error("Next car have not registered")]
    TrackNextCarHaveNotRegistered,
    #[error("Overwrap limit exceeded")]
    TrackOverwrapLimitExceeded,
    #[error("Specified car not found")]
    TrackSpecifiedCarNotFound,
    #[error("There is no running car")]
    TrackNobodyRunnning,
    #[error("Specified track not found")]
    NoSuchTrack,
    #[error("Competition did not configured")]
    CompetitionHaveNotConfigured,
    #[error("Competition configuration did not found")]
    CopmetitionConfigurationDidNotFound,
    #[error("Some assertion failed; application logic may wrong")]
    LogicError,
}

enum TimerState {
    HaveNotStarted,
    Started { start_date: TimeStamp },
    Stopped { time: Duration },
    Specified { time: Duration },
}

impl Serialize for TimerState {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            TimerState::HaveNotStarted => {
                let mut state = serializer.serialize_struct("TimerState", 1)?;
                state.serialize_field("type", "HaveNotStarted")?;
                state.end()
            }
            TimerState::Started { start_date } => {
                let mut state = serializer.serialize_struct("TimerState", 2)?;
                state.serialize_field("type", "Started")?;
                state.serialize_field("start_date", &start_date.timestamp_millis())?;
                state.end()
            }
            TimerState::Stopped { time } => {
                let mut state = serializer.serialize_struct("TimerState", 2)?;
                state.serialize_field("type", "Stopped")?;
                state.serialize_field("time", &time.as_millis())?;
                state.end()
            }
            TimerState::Specified { time } => {
                let mut state = serializer.serialize_struct("TimerState", 2)?;
                state.serialize_field("type", "Specified")?;
                state.serialize_field("time", &time.as_millis())?;
                state.end()
            }
        }
    }
}

impl Timer {
    fn new() -> Timer {
        trace!("New timer created");
        Timer {
            state: TimerState::HaveNotStarted,
        }
    }

    fn start(&mut self, date: TimeStamp) -> Result<()> {
        if let TimerState::Started { .. } = self.state {
            Err(AppError::TimerAlreadyStarted.into())
        } else {
            trace!("Timer started at {}", date);
            self.state = TimerState::Started { start_date: date };
            Ok(())
        }
    }

    fn stop(&mut self, date: TimeStamp) -> Result<()> {
        if let TimerState::Started { start_date } = self.state {
            trace!("Timer stopped at {}", date);
            self.state = TimerState::Stopped {
                time: (date - start_date).to_std()?,
            };
            Ok(())
        } else {
            Err(AppError::TimerHaveNotStarted.into())
        }
    }

    fn get_time(&self, date: TimeStamp) -> Result<Duration> {
        match self.state {
            TimerState::HaveNotStarted => Err(AppError::TimerHaveNotStarted.into()),
            TimerState::Started { start_date } => Ok((date - start_date).to_std()?),
            TimerState::Stopped { time } => Ok(time),
            TimerState::Specified { time } => Ok(time),
        }
    }

    fn set_time(&mut self, time: Duration) -> Result<()> {
        self.state = TimerState::Specified { time };
        Ok(())
    }

    fn is_running(&self) -> bool {
        if let TimerState::Started { .. } = self.state {
            true
        } else {
            false
        }
    }
}

#[derive(Clone, Eq, PartialEq, Hash)]
struct CompetitionEntryId {
    id: String,
}

impl CompetitionEntryId {
    fn new(id: &str) -> Self {
        Self { id: id.to_owned() }
    }
    fn get(&self) -> &str {
        &self.id
    }
}

impl Serialize for CompetitionEntryId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.id)
    }
}

type TrackId = String;

#[derive(Clone, Eq, PartialEq, Hash)]
struct CompetitionConfigurationId {
    id: String,
}

impl CompetitionConfigurationId {
    fn new(id: &str) -> Self {
        Self { id: id.to_owned() }
    }
    fn get(&self) -> &str {
        &self.id
    }
}

type ResultId = String;

/*
#[derive(Clone, Eq, PartialEq, Hash, Serialize, Deserialize)]
struct TimerId {
    id: String
}
*/

#[derive(Serialize)]
struct RunningCar {
    timer: Timer,
    id: CompetitionEntryId,
    touched_pylon_count: u32,
    derailment_count: u32,
}

impl RunningCar {
    fn new(id: CompetitionEntryId) -> RunningCar {
        RunningCar {
            timer: Timer::new(),
            id,
            touched_pylon_count: 0,
            derailment_count: 0,
        }
    }

    fn start(&mut self, date: TimeStamp) -> Result<()> {
        self.timer.start(date)
    }

    fn stop(&mut self, date: TimeStamp) -> Result<()> {
        self.timer.stop(date)
    }

    fn time(&self, date: TimeStamp) -> Result<Duration> {
        self.timer.get_time(date)
    }

    fn add_touched_pylon_count(&mut self) -> Result<()> {
        self.touched_pylon_count += 1;
        Ok(())
    }

    fn remove_touched_pylon_count(&mut self) -> Result<()> {
        self.touched_pylon_count -= 1;
        Ok(())
    }

    fn add_derailment_count(&mut self) -> Result<()> {
        self.derailment_count += 1;
        Ok(())
    }

    fn remove_derailment_count(&mut self) -> Result<()> {
        self.derailment_count -= 1;
        Ok(())
    }

    /*fn edit_time(&mut self, time: Duration) -> Result<()> {
        self.timer.set_time(time)
    }*/

    fn get_id(&self) -> &CompetitionEntryId {
        &self.id
    }
}

#[derive(Serialize)]
struct Track {
    running_cars: VecDeque<RunningCar>,
    pending_car: Option<RunningCar>,
    overwrap_limit: i64,
    record_type: String
}

impl Track {
    pub fn new(overwrap_limit: i64) -> Track {
        Track {
            running_cars: VecDeque::new(),
            pending_car: None,
            overwrap_limit,
            record_type: "Free".to_string()
        }
    }

    pub fn register_next_car(&mut self, competition_entry_id: CompetitionEntryId) -> Result<()> {
        self.pending_car = Some(RunningCar::new(competition_entry_id));
        Ok(())
    }

    pub fn start(&mut self, date: TimeStamp) -> Result<()> {
        if let Some(pending_car) = &mut self.pending_car {
            if self.running_cars.len() >= self.overwrap_limit as usize {
                return Err(AppError::TrackOverwrapLimitExceeded.into());
            }
            pending_car.start(date)?;
            self.running_cars
                .push_back(self.pending_car.take().unwrap());

            Ok(())
        } else {
            Err(AppError::TrackNextCarHaveNotRegistered.into())
        }
    }

    pub fn stop(
        &mut self,
        date: TimeStamp,
        competition_entry_id: Option<CompetitionEntryId>,
        result_id: ResultId,
    ) -> Result<Record> {
        let (car_index, car) = if let Some(competition_entry_id) = competition_entry_id {
            self.find_running_car(&competition_entry_id)?
        } else {
            self.running_cars
                .iter_mut()
                .next()
                .map_or(Err(AppError::TrackNobodyRunnning), |v| Ok((0 as usize, v)))?
        };

        car.stop(date)?;

        let car = self
            .running_cars
            .remove(car_index)
            .ok_or(AppError::LogicError)?;

        Ok(Record {
            id: result_id,
            state: RecordState::Checkered,
            duration: car.time(date)?,
            pylon_touch_count: car.touched_pylon_count,
            derailment_count: car.derailment_count,
            competition_entry_id: car.get_id().clone(),
            record_type: self.record_type.clone(),
            timestamp: date
        })
    }

    pub fn red_flag(&mut self, date: TimeStamp) -> Result<(), anyhow::Error> {
        let mut red_flagged_cars = VecDeque::new();
        swap(&mut self.running_cars, &mut red_flagged_cars);
        // TODO?: レッドフラグを受けた車を自動処理する
        Ok(())
    }

    pub fn miss_course(
        &mut self,
        date: TimeStamp,
        competition_entry_id: &CompetitionEntryId,
        result_id: ResultId,
    ) -> Result<Record> {
        let (car_index, car) = self.find_running_car(&competition_entry_id)?;

        car.stop(date)?;

        let car = self
            .running_cars
            .remove(car_index)
            .ok_or(AppError::LogicError)?;

        Ok(Record {
            id: result_id,
            state: RecordState::MissCourse,
            duration: car.time(date)?,
            pylon_touch_count: car.touched_pylon_count,
            derailment_count: car.derailment_count,
            competition_entry_id: competition_entry_id.clone(),
            record_type: self.record_type.clone(),
            timestamp: date
        })
    }

    pub fn did_not_finished(
        &mut self,
        date: TimeStamp,
        competition_entry_id: &CompetitionEntryId,
        result_id: ResultId,
    ) -> Result<Record> {
        let (car_index, car) = self.find_running_car(&competition_entry_id)?;

        car.stop(date)?;

        let car = self
            .running_cars
            .remove(car_index)
            .ok_or(AppError::LogicError)?;

        Ok(Record {
            id: result_id,
            state: RecordState::DidNotFinished,
            duration: car.time(date)?,
            pylon_touch_count: car.touched_pylon_count,
            derailment_count: car.derailment_count,
            competition_entry_id: competition_entry_id.clone(),
            record_type: self.record_type.clone(),
            timestamp: date
        })
    }

    pub fn add_touched_pylon_count(
        &mut self,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<()> {
        let (car_index, car) = self.find_running_car(&competition_entry_id)?;
        car.add_touched_pylon_count()?;
        Ok(())
    }

    pub fn remove_touched_pylon_count(
        &mut self,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<()> {
        let (car_index, car) = self.find_running_car(&competition_entry_id)?;
        car.remove_touched_pylon_count()?;
        Ok(())
    }

    pub fn add_derailment_count(
        &mut self,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<()> {
        let (car_index, car) = self.find_running_car(&competition_entry_id)?;
        car.add_derailment_count()?;
        Ok(())
    }

    pub fn remove_derailment_count(
        &mut self,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<()> {
        let (car_index, car) = self.find_running_car(&competition_entry_id)?;
        car.remove_derailment_count()?;
        Ok(())
    }

    fn find_running_car(
        &mut self,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<(usize, &mut RunningCar)> {
        if let Some(index) = self
            .running_cars
            .iter()
            .position(|car| car.get_id() == competition_entry_id)
        {
            Ok((index, self.running_cars.get_mut(index).unwrap()))
        } else {
            Err(AppError::TrackSpecifiedCarNotFound.into())
        }
    }

    fn set_recond_type(&mut self, record_type: &str) -> Result<()> {
        self.record_type = record_type.to_string();
        Ok(())
    }
}

#[derive(Serialize)]
enum RecordState {
    Checkered,
    MissCourse,
    DidNotStarted,
    DidNotFinished,
    Removed,
}

#[serde_as]
#[derive(Serialize)]
struct Record {
    id: ResultId,
    state: RecordState,
    #[serde_as(as = "serde_with::DurationMilliSeconds<f64>")] // FIXME
    duration: Duration,
    competition_entry_id: CompetitionEntryId,
    pylon_touch_count: u32,
    derailment_count: u32,
    record_type: String,
    #[serde_as(as = "serde_with::TimestampSeconds<i64>")] // FIXME
    timestamp: TimeStamp
}

impl Record {
    fn get_duration(&self) -> Duration {
        self.duration
    }

    fn get_competition_entry_id(&self) -> &CompetitionEntryId {
        &self.competition_entry_id
    }
}

/*impl Serialize for Record {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("TimeResult", 2)?;
        state.serialize_field("duration", &self.duration.num_milliseconds())?;
        state.serialize_field("competition_entry_id", &self.competition_entry_id)?;
        state.end()
    }
}*/

struct Competition {
    records: HashMap<ResultId, Record>,
    tracks: HashMap<TrackId, Track>,
    on_result: Option<Box<dyn Fn() -> () + Sync + Send>>,
}

impl Serialize for Competition {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Competition", 2)?;
        state.serialize_field("records", &self.records)?;
        state.serialize_field("tracks", &self.tracks)?;
        state.end()
    }
}

enum CompetitionEventKind {
    RegisterNextCar {
        track_id: TrackId,
        competition_entry_id: CompetitionEntryId,
    },
    Start {
        track_id: TrackId,
    },
    Stop {
        result_id: ResultId,
        track_id: TrackId,
        competition_entry_id: Option<CompetitionEntryId>,
    },
    RedFlag {
        track_id: TrackId,
    },
    AddPylonTouch {
        track_id: TrackId,
        competition_entry_id: CompetitionEntryId,
    },
    RemovePylonTouch {
        track_id: TrackId,
        competition_entry_id: CompetitionEntryId,
    },
    AddDerailment {
        track_id: TrackId,
        competition_entry_id: CompetitionEntryId,
    },
    RemoveDerailment {
        track_id: TrackId,
        competition_entry_id: CompetitionEntryId,
    },
    MarkDNF {
        result_id: ResultId,
        track_id: TrackId,
        competition_entry_id: CompetitionEntryId,
    },
    MarkMissCourse {
        result_id: ResultId,
        track_id: TrackId,
        competition_entry_id: CompetitionEntryId,
    },

    MarkDNFToRecord {
        result_id: ResultId,
    },
    MarkMissCourseToRecord {
        result_id: ResultId,
    },
    RemoveRecord {
        result_id: ResultId,
    },
    RecoveryRecord {
        result_id: ResultId,
    },
    ChangeRecordPylonTouchCount {
        result_id: ResultId,
        count: u32,
    },
    ChangeRecordDerailmentCount {
        result_id: ResultId,
        count: u32,
    },
    ChangeRecordType {
        result_id: ResultId,
        record_type: String
    },
    SetTrackRecordType {
        track_id: TrackId,
        record_type: String
    }
}

struct CompetitionEvent {
    time_stamp: TimeStamp,
    kind: CompetitionEventKind,
}

impl CompetitionEvent {
    fn new(time_stamp: TimeStamp, kind: CompetitionEventKind) -> Self {
        Self { time_stamp, kind }
    }
}

impl PartialEq for CompetitionEvent {
    fn eq(&self, other: &Self) -> bool {
        self.time_stamp.eq(&other.time_stamp)
    }
}

impl PartialOrd for CompetitionEvent {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.time_stamp.partial_cmp(&other.time_stamp)
    }
}

impl Competition {
    fn register_next_car(
        &mut self,
        track_id: &TrackId,
        competition_entry_id: CompetitionEntryId,
    ) -> Result<(), anyhow::Error> {
        let track = self.get_track(track_id)?;
        track.register_next_car(competition_entry_id.clone())?;
        Ok(())
    }

    fn start(&mut self, timestamp: TimeStamp, track_id: &TrackId) -> Result<(), anyhow::Error> {
        let track = self.get_track(track_id)?;
        track.start(timestamp)?;
        Ok(())
    }

    fn stop(
        &mut self,
        timestamp: TimeStamp,
        track_id: &TrackId,
        competition_entry_id: Option<&CompetitionEntryId>,
        result_id: &ResultId,
    ) -> Result<(), anyhow::Error> {
        let track = self.get_track(track_id)?;
        let result = track.stop(timestamp, competition_entry_id.cloned(), result_id.clone())?;
        self.records.insert(result_id.clone(), result);
        Ok(())
    }

    fn add_touched_pylon_count(
        &mut self,
        track_id: &TrackId,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<(), anyhow::Error> {
        let mut track = self.get_track(track_id)?;
        track.add_touched_pylon_count(competition_entry_id)?;
        Ok(())
    }

    fn remove_touched_pylon_count(
        &mut self,
        track_id: &TrackId,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<(), anyhow::Error> {
        let mut track = self.get_track(track_id)?;
        track.remove_touched_pylon_count(competition_entry_id)?;
        Ok(())
    }

    fn add_derailment_count(
        &mut self,
        track_id: &TrackId,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<(), anyhow::Error> {
        let mut track = self.get_track(track_id)?;
        track.add_derailment_count(competition_entry_id);
        Ok(())
    }

    fn remove_derailment_count(
        &mut self,
        track_id: &TrackId,
        competition_entry_id: &CompetitionEntryId,
    ) -> Result<(), anyhow::Error> {
        let mut track = self.get_track(track_id)?;
        track.remove_derailment_count(competition_entry_id);
        Ok(())
    }

    fn miss_course(
        &mut self,
        timestamp: TimeStamp,
        track_id: &TrackId,
        competition_entry_id: &CompetitionEntryId,
        result_id: &ResultId,
    ) -> Result<(), anyhow::Error> {
        let track = self.get_track(track_id)?;
        let result = track.miss_course(timestamp, competition_entry_id, result_id.clone())?;

        self.records.insert(result_id.clone(), result);
        Ok(())
    }

    fn did_not_finished(
        &mut self,
        timestamp: TimeStamp,
        track_id: &TrackId,
        competition_entry_id: &CompetitionEntryId,
        result_id: &ResultId,
    ) -> Result<(), anyhow::Error> {
        let track = self.get_track(track_id)?;
        let result = track.did_not_finished(timestamp, competition_entry_id, result_id.clone())?;

        self.records.insert(result_id.clone(), result);
        Ok(())
    }

    fn red_flag(&mut self, timestamp: TimeStamp, track_id: &TrackId) -> Result<(), anyhow::Error> {
        let mut track = self.get_track(track_id)?;
        track.red_flag(timestamp);

        Ok(())
    }

    fn set_track_record_type(&mut self, track_id: &TrackId, record_type: &str) -> Result<(), anyhow::Error> {
        self.get_track(track_id)?.set_recond_type(record_type)?;

        Ok(())
    }


    fn mark_dnf_to_record(&mut self, record_id: &ResultId) -> Result<(), anyhow::Error> {
        self.get_record(record_id)?.state = RecordState::DidNotFinished;

        Ok(())
    }

    fn mark_miss_course_to_record(&mut self, record_id: &ResultId) -> Result<(), anyhow::Error> {
        self.get_record(record_id)?.state = RecordState::MissCourse;

        Ok(())
    }

    fn mark_removed_to_record(&mut self, record_id: &ResultId) -> Result<(), anyhow::Error> {
        self.get_record(record_id)?.state = RecordState::Removed;

        Ok(())
    }

    fn recovery_record(&mut self, record_id: &ResultId) -> Result<(), anyhow::Error> {
        self.get_record(record_id)?.state = RecordState::Checkered;

        Ok(())
    }

    fn change_pylon_touch_count_of_record(
        &mut self,
        record_id: &ResultId,
        count: &u32,
    ) -> Result<(), anyhow::Error> {
        self.get_record(record_id)?.pylon_touch_count = count.clone();
        Ok(())
    }

    fn change_derailment_count_of_record(
        &mut self,
        record_id: &ResultId,
        count: &u32,
    ) -> Result<(), anyhow::Error> {
        self.get_record(record_id)?.derailment_count = count.clone();
        Ok(())
    }

    fn change_record_type(
        &mut self,
        record_id: &ResultId,
        record_type: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_record(record_id)?.record_type = record_type.to_string();
        Ok(())
    }

    fn get_track<'a>(&'a mut self, track_id: &TrackId) -> Result<&'a mut Track, anyhow::Error> {
        self.tracks
            .get_mut(track_id)
            .ok_or(AppError::NoSuchTrack.into())
    }

    fn get_record<'a>(&'a mut self, result_id: &ResultId) -> Result<&'a mut Record, anyhow::Error> {
        self.records
            .get_mut(result_id)
            .ok_or(AppError::NoSuchTrack.into()) // TODO NoSuchRecord
    }

    fn on_result(mut self, callback: Box<dyn Fn() -> () + Sync + Send>) -> Self {
        self.on_result = Some(callback);
        self
    }
}

impl Replayable for Competition {
    type Command = CompetitionEvent;
    type CommandResult = Result<(), anyhow::Error>;

    fn command(&mut self, event: &CompetitionEvent) -> Self::CommandResult {
        match &event.kind {
            CompetitionEventKind::RegisterNextCar {
                track_id,
                competition_entry_id,
            } => self.register_next_car(track_id, competition_entry_id.clone()),
            CompetitionEventKind::Start { track_id } => self.start(event.time_stamp, track_id),
            CompetitionEventKind::Stop {
                result_id,
                track_id,
                competition_entry_id,
            } => self.stop(
                event.time_stamp,
                track_id,
                competition_entry_id.as_ref(),
                result_id,
            ),
            CompetitionEventKind::RedFlag { track_id } => self.red_flag(event.time_stamp, track_id),
            CompetitionEventKind::AddPylonTouch {
                track_id,
                competition_entry_id,
            } => self.add_touched_pylon_count(track_id, competition_entry_id),
            CompetitionEventKind::RemovePylonTouch {
                track_id,
                competition_entry_id,
            } => self.remove_touched_pylon_count(track_id, competition_entry_id),
            CompetitionEventKind::AddDerailment {
                track_id,
                competition_entry_id,
            } => self.add_derailment_count(track_id, competition_entry_id),
            CompetitionEventKind::RemoveDerailment {
                track_id,
                competition_entry_id,
            } => self.remove_derailment_count(track_id, competition_entry_id),
            CompetitionEventKind::MarkDNF {
                track_id,
                competition_entry_id,
                result_id,
            } => self.did_not_finished(event.time_stamp, track_id, competition_entry_id, result_id),
            CompetitionEventKind::MarkMissCourse {
                track_id,
                competition_entry_id,
                result_id,
            } => self.miss_course(event.time_stamp, track_id, competition_entry_id, result_id),
            CompetitionEventKind::MarkDNFToRecord { result_id } => {
                self.mark_dnf_to_record(result_id)
            }
            CompetitionEventKind::MarkMissCourseToRecord { result_id } => {
                self.mark_miss_course_to_record(result_id)
            }
            CompetitionEventKind::RemoveRecord { result_id } => {
                self.mark_removed_to_record(result_id)
            }
            CompetitionEventKind::RecoveryRecord { result_id } => self.recovery_record(result_id),
            CompetitionEventKind::ChangeRecordPylonTouchCount { result_id, count } => {
                self.change_pylon_touch_count_of_record(result_id, count)
            }
            CompetitionEventKind::ChangeRecordDerailmentCount { result_id, count } => {
                self.change_derailment_count_of_record(result_id, count)
            }
            CompetitionEventKind::ChangeRecordType { result_id, record_type } => {
                self.change_record_type(result_id, record_type)
            },
            CompetitionEventKind::SetTrackRecordType { track_id, record_type } => {
                self.set_track_record_type(track_id, record_type, )
            },
        }
    }
}

#[derive(Clone)]
struct CompetitionConfiguration {
    tracks: HashMap<String, CompetitionConfigurationTrack>,
}

#[derive(Clone)]
struct CompetitionConfigurationTrack {
    overlap_limit: i64,
}

impl CompetitionConfiguration {
    fn build_competition(&self) -> Competition {
        let mut tracks = HashMap::new();
        for (id, config) in self.tracks.iter() {
            tracks.insert(id.clone(), Track::new(config.overlap_limit));
        }

        Competition {
            records: HashMap::new(),
            tracks,
            on_result: None,
        }
    }
}

#[async_trait]
trait CompetitionConfigurationRepository {
    async fn competition_configuration(
        &mut self,
        config_id: &CompetitionConfigurationId,
    ) -> Result<Option<CompetitionConfiguration>, anyhow::Error>;
}

#[async_trait]
trait CompetitionResultRepository {
    async fn competition_result(
        &mut self,
        competition_entry_id: CompetitionEntryId,
    ) -> Result<(), anyhow::Error>;
}

struct MockCompetitionConfigurationRepository(CompetitionConfiguration);

#[async_trait]
impl CompetitionConfigurationRepository for MockCompetitionConfigurationRepository {
    async fn competition_configuration(
        &mut self,
        _cofig_id: &CompetitionConfigurationId,
    ) -> Result<Option<CompetitionConfiguration>> {
        Ok(Some(self.0.clone()))
    }
}

struct MockCompetitionResultRepository();

#[async_trait]
impl CompetitionResultRepository for MockCompetitionResultRepository {
    async fn competition_result(
        &mut self,
        competition_entry_id: CompetitionEntryId,
    ) -> Result<(), anyhow::Error> {
        todo!()
    }
}

fn time_stamp_from_unixmsec(unixmsec: u64) -> Result<TimeStamp, anyhow::Error> {
    println!("time-Stamp-from-unixmsec: {}", unixmsec);

    let redundunt_nsec = (unixmsec % 1000) as u32;

    Utc.timestamp_opt((unixmsec / 1000) as i64, redundunt_nsec * 1000 * 1000)
        .single()
        .ok_or(AppError::LogicError.into())
}

struct TimingSystemApp {
    competition: Option<Replayer<Competition, Box<dyn Fn() -> Competition + Sync + Send>>>,
    competition_configuration_repository:
        Arc<Mutex<dyn CompetitionConfigurationRepository + Sync + Send>>,
}

impl TimingSystemApp {
    async fn create_competition(
        &mut self,
        config_id: CompetitionConfigurationId,
    ) -> Result<(), anyhow::Error> {
        let config = self
            .competition_configuration_repository
            .lock()
            .await
            .competition_configuration(&config_id)
            .await?
            .ok_or(AppError::CopmetitionConfigurationDidNotFound)?;
        self.competition = Some(Replayer::new(Box::new(move || {
            config
                .build_competition()
                .on_result(Box::new(|| println!("Changed!")))
        })));

        Ok(())
    }

    fn get_competition<'a>(
        &'a mut self,
    ) -> Result<
        &'a mut Replayer<Competition, Box<dyn Fn() -> Competition + Sync + Send>>,
        anyhow::Error,
    > {
        Ok(self
            .competition
            .as_mut()
            .ok_or(AppError::CompetitionHaveNotConfigured)?)
    }

    fn register_next_car(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent {
            time_stamp: time_stamp_from_unixmsec(time_stamp)?,
            kind: CompetitionEventKind::RegisterNextCar {
                track_id: track_id.to_string(),
                competition_entry_id: CompetitionEntryId::new(competition_entry_id),
            },
        });

        Ok(())
    }

    fn start(&mut self, time_stamp: u64, track_id: &str) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::Start {
                track_id: track_id.to_string(),
            },
        ));

        Ok(())
    }

    fn stop(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: Option<&CompetitionEntryId>,
    ) -> Result<(), anyhow::Error> {
        let result_id = nanoid!();
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::Stop {
                result_id,
                track_id: track_id.to_string(),
                competition_entry_id: competition_entry_id.cloned(),
            },
        ));

        Ok(())
    }

    fn red_flag(&mut self, time_stamp: u64, track_id: &str) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::RedFlag {
                track_id: track_id.to_string(),
            },
        ));

        Ok(())
    }

    fn did_not_finished(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::MarkDNF {
                result_id: nanoid!(),
                track_id: track_id.to_string(),
                competition_entry_id: CompetitionEntryId::new(competition_entry_id),
            },
        ));

        Ok(())
    }

    fn miss_course(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::MarkMissCourse {
                result_id: nanoid!(),
                track_id: track_id.to_string(),
                competition_entry_id: CompetitionEntryId::new(competition_entry_id),
            },
        ));

        Ok(())
    }

    fn mark_pylon_touch(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::AddPylonTouch {
                track_id: track_id.to_string(),
                competition_entry_id: CompetitionEntryId::new(competition_entry_id),
            },
        ));

        Ok(())
    }

    fn remove_pylon_touch(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::RemovePylonTouch {
                track_id: track_id.to_string(),
                competition_entry_id: CompetitionEntryId::new(competition_entry_id),
            },
        ));

        Ok(())
    }

    fn add_derailment_count(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::AddDerailment {
                track_id: track_id.to_string(),
                competition_entry_id: CompetitionEntryId::new(competition_entry_id),
            },
        ));

        Ok(())
    }

    fn remove_derailment_count(
        &mut self,
        time_stamp: u64,
        track_id: &str,
        competition_entry_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::RemoveDerailment {
                track_id: track_id.to_string(),
                competition_entry_id: CompetitionEntryId::new(competition_entry_id),
            },
        ));

        Ok(())
    }

    fn mark_dnf_to_record(
        &mut self,
        time_stamp: u64,
        record_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::MarkDNFToRecord {
                result_id: record_id.to_string(),
            },
        ));

        Ok(())
    }

    fn mark_miss_course_to_record(
        &mut self,
        time_stamp: u64,
        record_id: &str,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::MarkMissCourseToRecord {
                result_id: record_id.to_string(),
            },
        ));

        Ok(())
    }

    fn remove_record(&mut self, time_stamp: u64, record_id: &str) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::RemoveRecord {
                result_id: record_id.to_string(),
            },
        ));

        Ok(())
    }

    fn recovery_record(&mut self, time_stamp: u64, record_id: &str) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::RecoveryRecord {
                result_id: record_id.to_string(),
            },
        ));

        Ok(())
    }

    fn change_record_type(&mut self, time_stamp: u64, record_id: &str, record_type: &str) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::ChangeRecordType {
                result_id: record_id.to_string(),
                record_type: record_type.to_string()
            },
        ));

        Ok(())
    }

    fn set_track_record_type(&mut self, time_stamp: u64, track_id: &str, record_type: &str) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::SetTrackRecordType {
                track_id: track_id.to_string(),
                record_type: record_type.to_string()
            },
        ));

        Ok(())
    }



    fn change_record_pylon_touch_count(
        &mut self,
        time_stamp: u64,
        record_id: &str,
        count: u32,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::ChangeRecordPylonTouchCount {
                result_id: record_id.to_string(),
                count,
            },
        ));

        Ok(())
    }

    fn change_derailment_count_of_record(
        &mut self,
        time_stamp: u64,
        record_id: &str,
        count: u32,
    ) -> Result<(), anyhow::Error> {
        self.get_competition()?.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::ChangeRecordDerailmentCount {
                result_id: record_id.to_string(),
                count,
            },
        ));

        Ok(())
    }

    fn get_registered_next_car(&mut self, track_id: &str) -> Result<Option<String>, anyhow::Error> {
        Ok(self
            .get_competition()?
            .get()
            .tracks
            .get(track_id)
            .ok_or(AppError::NoSuchTrack)?
            .pending_car
            .as_ref()
            .map(|car| car.get_id().get().to_owned()))
    }

    /*fn get_records<'a>(&'a mut self) -> Result<&'a [Record], anyhow::Error> {
        Ok(self.get_competition()?.get().records.as_slice())
    }*/

    fn get_state_tree(&mut self) -> Result<String, anyhow::Error> {
        Ok(serde_json::to_string(self.get_competition()?.get())?)
    }

    fn get_running_cars(&mut self, track_id: &str) -> Result<Vec<String>, anyhow::Error> {
        Ok(self
            .get_competition()?
            .get()
            .tracks
            .get(track_id)
            .ok_or(AppError::NoSuchTrack)?
            .running_cars
            .iter()
            .map(|i| i.get_id().get().to_string())
            .collect())
    }

    /*fn command(&mut self, command: CompetitionEvent) -> Result<(), anyhow::Error> {
        Ok(self.get_competition()?.command(command))
    }*/
}

#[tokio::main]
async fn main() {
    env_logger::init();
    server::run().await.unwrap();
}
