mod server;

use std::{
    collections::{HashMap, VecDeque}
};

use anyhow::Result;

use chrono::{TimeZone, Utc};
use thiserror::Error;

type Duration = chrono::Duration;
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

struct Timer {
    /*start_date: Option<TimeStamp>,
    time: Option<Duration>,*/
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

impl Timer {
    fn new() -> Timer {
        Timer {
            state: TimerState::HaveNotStarted,
        }
    }

    fn start(&mut self, date: TimeStamp) -> Result<()> {
        if let TimerState::Started { .. } = self.state {
            Err(AppError::TimerAlreadyStarted.into())
        } else {
            self.state = TimerState::Started { start_date: date };
            Ok(())
        }
    }

    fn stop(&mut self, date: TimeStamp) -> Result<()> {
        if let TimerState::Started { start_date } = self.state {
            self.state = TimerState::Stopped {
                time: date - start_date,
            };
            Ok(())
        } else {
            Err(AppError::TimerHaveNotStarted.into())
        }
    }

    fn get_time(&self, date: TimeStamp) -> Result<Duration> {
        match self.state {
            TimerState::HaveNotStarted => Err(AppError::TimerHaveNotStarted.into()),
            TimerState::Started { start_date } => Ok(date - start_date),
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
struct CarId {
    id: String,
}

impl CarId {
    fn new(id: &str) -> Self {
        Self { id: id.to_owned() }
    }
    fn get(&self) -> &str {
        &self.id
    }
}

#[derive(Clone, Eq, PartialEq, Hash)]
struct TrackId {
    id: String,
}

impl TrackId {
    fn new(id: &str) -> Self {
        Self { id: id.to_owned() }
    }
    fn get(&self) -> &str {
        &self.id
    }
}

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

struct RunningCar {
    timer: Timer,
    id: CarId,
}

impl RunningCar {
    fn new(id: CarId) -> RunningCar {
        RunningCar {
            timer: Timer::new(),
            id,
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

    /*fn edit_time(&mut self, time: Duration) -> Result<()> {
        self.timer.set_time(time)
    }*/

    fn get_id(&self) -> &CarId {
        &self.id
    }
}

struct Track {
    running_cars: VecDeque<RunningCar>,
    pending_car: Option<RunningCar>,
    overwrap_limit: i64,
}

impl Track {
    pub fn new(overwrap_limit: i64) -> Track {
        Track {
            running_cars: VecDeque::new(),
            pending_car: None,
            overwrap_limit,
        }
    }

    pub fn register_next_car(&mut self, car_id: CarId) -> Result<()> {
        self.pending_car = Some(RunningCar::new(car_id));
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

    pub fn stop(&mut self, date: TimeStamp, car_id: Option<CarId>) -> Result<TimeResult> {
        let (car_index, car) = if let Some(car_id) = car_id {
            self.find_running_car(&car_id)?
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

        Ok(TimeResult {
            duration: car.time(date)?,
            car_id: car.get_id().clone(),
        })
    }

    fn find_running_car(&mut self, car_id: &CarId) -> Result<(usize, &mut RunningCar)> {
        if let Some(index) = self
            .running_cars
            .iter()
            .position(|car| car.get_id() == car_id)
        {
            Ok((index, self.running_cars.get_mut(index).unwrap()))
        } else {
            Err(AppError::TrackSpecifiedCarNotFound.into())
        }
    }
}

struct TimeResult {
    duration: Duration,
    car_id: CarId,
}

impl TimeResult {
    fn get_duration(&self) -> Duration {
        self.duration
    }

    fn get_car_id(&self) -> &CarId {
        &self.car_id
    }
}

struct Competition {
    results: Vec<TimeResult>,
    tracks: HashMap<TrackId, Track>,
}

enum CompetitionEventKind {
    RegisterNextCar {
        track_id: TrackId,
        car_id: CarId,
    },
    Start {
        track_id: TrackId,
    },
    Stop {
        track_id: TrackId,
        car_id: Option<CarId>,
    },
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
        car_id: CarId,
    ) -> Result<(), anyhow::Error> {
        let track = self.get_track(track_id)?;
        track.register_next_car(car_id.clone())?;
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
        car_id: Option<&CarId>,
    ) -> Result<(), anyhow::Error> {
        let track = self.get_track(track_id)?;
        let result = track.stop(timestamp, car_id.cloned())?;
        self.results.push(result);
        Ok(())
    }

    fn get_track<'a>(&'a mut self, track_id: &TrackId) -> Result<&'a mut Track, anyhow::Error> {
        self.tracks
            .get_mut(track_id)
            .ok_or(AppError::NoSuchTrack.into())
    }
}

impl Replayable for Competition {
    type Command = CompetitionEvent;
    type CommandResult = Result<(), anyhow::Error>;

    fn command(&mut self, event: &CompetitionEvent) -> Self::CommandResult {
        match &event.kind {
            CompetitionEventKind::RegisterNextCar { track_id, car_id } => {
                self.register_next_car(track_id, car_id.clone())
            }
            CompetitionEventKind::Start { track_id } => self.start(event.time_stamp, track_id),
            CompetitionEventKind::Stop { track_id, car_id } => {
                self.stop(event.time_stamp, track_id, car_id.as_ref())
            }
        }
    }
}

trait Have<T> {
    fn get(&mut self) -> &mut T;
}

trait MayHave<T> {
    fn get(&mut self) -> Result<&mut T, anyhow::Error>;
}

fn time_stamp_from_unixmsec(unixmsec: i64) -> Result<TimeStamp, anyhow::Error> {
    let redundunt_nsec = u32::try_from(unixmsec)? % 1000;

    Ok(Utc.timestamp(unixmsec / 1000, redundunt_nsec))
}

trait CompetitionService<'a, F>: MayHave<Replayer<Competition, F>>
where
    F: Fn() -> Competition + 'a,
{
    fn register_next_car(
        &mut self,
        time_stamp: i64,
        track_id: &str,
        car_id: &str,
    ) -> Result<(), anyhow::Error> {
        let competition: &mut Replayer<Competition, F> = MayHave::get(self)?;
        competition.command(CompetitionEvent {
            time_stamp: time_stamp_from_unixmsec(time_stamp)?,
            kind: CompetitionEventKind::RegisterNextCar {
                track_id: TrackId::new(track_id),
                car_id: CarId::new(car_id),
            },
        });

        Ok(())
    }

    fn get_current_tracks(&mut self) -> Result<Vec<String>, anyhow::Error> {
        let competition: &mut Replayer<Competition, F> = MayHave::get(self)?;

        Ok(competition
            .get()
            .tracks
            .iter()
            .map(|track| track.0.get().to_owned())
            .collect::<Vec<String>>())
    }

    fn get_registered_next_car(&mut self, track_id: &str) -> Result<Option<String>, anyhow::Error> {
        let competition: &mut Replayer<Competition, F> = MayHave::get(self)?;

        Ok(competition
            .get()
            .tracks
            .get(&TrackId::new(track_id))
            .ok_or(AppError::NoSuchTrack)?
            .pending_car
            .as_ref()
            .map(|car| car.get_id().get().to_owned()))
    }

    fn start(&mut self, time_stamp: i64, track_id: &str) -> Result<(), anyhow::Error> {
        let competition: &mut Replayer<Competition, F> = MayHave::get(self)?;
        competition.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::Start {
                track_id: TrackId::new(track_id),
            },
        ));

        Ok(())
    }

    fn stop(
        &mut self,
        time_stamp: i64,
        track_id: &str,
        car_id: Option<&CarId>,
    ) -> Result<(), anyhow::Error> {
        let competition: &mut Replayer<Competition, F> = MayHave::get(self)?;
        competition.command(CompetitionEvent::new(
            time_stamp_from_unixmsec(time_stamp)?,
            CompetitionEventKind::Stop {
                track_id: TrackId::new(track_id),
                car_id: car_id.cloned(),
            },
        ));

        Ok(())
    }

    fn get_results(&'a mut self) -> Result<&'a [TimeResult], anyhow::Error> {
        let competition: &mut Replayer<Competition, F> = MayHave::get(self)?;

        Ok(competition.get().results.as_slice())
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
            tracks.insert(TrackId { id: id.clone() }, Track::new(config.overlap_limit));
        }

        Competition {
            results: Vec::new(),
            tracks,
        }
    }
}

#[tonic::async_trait]
trait CompetitionConfigurationRepository {
    async fn competition_configuration(
        &mut self,
        config_id: &CompetitionConfigurationId,
    ) -> Result<Option<CompetitionConfiguration>, anyhow::Error>;
}

struct MockCompetitionConfigurationRepository(CompetitionConfiguration);

#[tonic::async_trait]
impl CompetitionConfigurationRepository for MockCompetitionConfigurationRepository {
    async fn competition_configuration(
        &mut self,
        _cofig_id: &CompetitionConfigurationId,
    ) -> Result<Option<CompetitionConfiguration>> {
        Ok(Some(self.0.clone()))
    }
}

struct TimingSystemApp<T>
where
    T: CompetitionConfigurationRepository + Sync + Send,
{
    competition: Option<Replayer<Competition, Box<dyn Fn() -> Competition + Sync + Send>>>,
    competition_configuration_repository: T,
}

impl<T> TimingSystemApp<T>
where
    T: CompetitionConfigurationRepository + Sync + Send,
{
    // TODO:
    async fn create_competition(
        &mut self,
        config_id: CompetitionConfigurationId,
    ) -> Result<(), anyhow::Error> {
        let config = self
            .competition_configuration_repository
            .competition_configuration(&config_id)
            .await?
            .ok_or(AppError::CopmetitionConfigurationDidNotFound)?;
        self.competition = Some(Replayer::new(Box::new(move || config.build_competition())));

        Ok(())
    }
}

impl<T> MayHave<Replayer<Competition, Box<dyn Fn() -> Competition + Sync + Send>>>
    for TimingSystemApp<T>
where
    T: CompetitionConfigurationRepository + Sync + Send,
{
    fn get(
        &mut self,
    ) -> Result<&mut Replayer<Competition, Box<dyn Fn() -> Competition + Sync + Send>>, anyhow::Error>
    {
        Ok(self
            .competition
            .as_mut()
            .ok_or(AppError::CompetitionHaveNotConfigured)?)
    }
}

impl<T> CompetitionService<'_, Box<dyn Fn() -> Competition + Sync + Send>> for TimingSystemApp<T> where
    T: CompetitionConfigurationRepository + Sync + Send
{
}

#[tokio::main]
async fn main() {
    server::run().await.unwrap();
}
