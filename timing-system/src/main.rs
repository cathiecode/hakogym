use std::{collections::VecDeque, future::pending};

use anyhow::Result;

use chrono::{DateTime, Duration, Utc};
use thiserror::Error;

trait Replayable<Command> {
    type CommandResult;
    type CommandError;
    fn command(&mut self, event: &Command) -> Result<Self::CommandResult, Self::CommandError>;
}

struct Replayer<Model, Command, Factory> {
    entity: Model,
    commands: Vec<Command>,
    factory: Factory
}

impl<Model: Replayable<Command>, Command: Ord, Factory: Fn() -> Model> Replayer<Model, Command, Factory> {
    fn new(factory: Factory) -> Replayer<Model, Command, Factory> {
        Replayer {
            entity: factory(),
            commands: Vec::new(),
            factory
        }
    }

    fn from_commands(factory: Factory, commands: Vec<Command>) -> Replayer<Model, Command, Factory> {
        let mut replayer = Replayer {
            entity: factory(),
            commands,
            factory,
        };

        replayer.recalc();

        replayer
    }

    pub fn command(&mut self, command: Command) {
        self.insert(command)
    }

    pub fn get(&self) -> &Model {
        &self.entity
    }

    fn insert(&mut self, command: Command) {
        let is_last = self
            .commands
            .last()
            .map_or(true, |last_command| last_command < &command);

        self.commands.push(command);

        self.commands.sort(); // OPTIMIZE: Sort every time is inefficient

        if !is_last {
            self.recalc()
        }
    }

    fn recalc(&mut self) {
        self.entity = (self.factory)();
        for command in self.commands.iter() {
            self.entity.command(command);
        }
    }
}

impl<Model, T, U> AsRef<Model> for Replayer<Model, T, U> {
    fn as_ref(&self) -> &Model {
        &self.entity
    }
}

struct Timer {
    /*start_date: Option<DateTime<Utc>>,
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
    #[error("Some assertion failed; application logic may wrong")]
    LogicError,
}

enum TimerState {
    HaveNotStarted,
    Started { start_date: DateTime<Utc> },
    Stopped { time: Duration },
    Specified { time: Duration },
}

impl Timer {
    fn new() -> Timer {
        Timer {
            state: TimerState::HaveNotStarted,
        }
    }

    fn start(&mut self, date: DateTime<Utc>) -> Result<()> {
        if let TimerState::Started { .. } = self.state {
            Err(AppError::TimerAlreadyStarted.into())
        } else {
            self.state = TimerState::Started { start_date: date };
            Ok(())
        }
    }

    fn stop(&mut self, date: DateTime<Utc>) -> Result<()> {
        if let TimerState::Started { start_date } = self.state {
            self.state = TimerState::Stopped {
                time: date - start_date,
            };
            Ok(())
        } else {
            Err(AppError::TimerHaveNotStarted.into())
        }
    }

    fn get_time(&self, date: DateTime<Utc>) -> Result<Duration> {
        match self.state {
            TimerState::HaveNotStarted => Err(AppError::TimerHaveNotStarted.into()),
            TimerState::Started { start_date } => Ok(date - start_date),
            TimerState::Stopped { time } => Ok(time),
            TimerState::Specified { time } => Ok(time),
        }
    }

    fn set_time(&mut self, time: Duration) -> Result<()> {
        self.state = TimerState::Specified { time: time };
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

#[derive(Clone, Copy, Eq, PartialEq)]
struct CarId(i64);

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

    fn start(&mut self, date: DateTime<Utc>) -> Result<()> {
        self.timer.start(date)
    }

    fn stop(&mut self, date: DateTime<Utc>) -> Result<()> {
        self.timer.stop(date)
    }

    fn time(&self, date: DateTime<Utc>) -> Result<Duration> {
        self.timer.get_time(date)
    }

    /*fn edit_time(&mut self, time: Duration) -> Result<()> {
        self.timer.set_time(time)
    }*/

    fn getId(&self) -> CarId {
        self.id
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

    pub fn register_next_car(&mut self, carId: CarId) -> Result<()> {
        self.pending_car = Some(RunningCar::new(carId));
        Ok(())
    }

    pub fn start(&mut self, date: DateTime<Utc>) -> Result<()> {
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

    pub fn goal(&mut self, date: DateTime<Utc>, car_id: Option<CarId>) -> Result<TimeResult> {
        let (car_index, car) = if let Some(car_id) = car_id {
            self.find_running_car(car_id)?
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
            car_id: car.getId(),
        })
    }

    fn find_running_car(&mut self, car_id: CarId) -> Result<(usize, &mut RunningCar)> {
        if let Some(index) = self
            .running_cars
            .iter()
            .position(|car| car.getId() == car_id)
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

    fn get_car_id(&self) -> CarId {
        self.car_id
    }
}


struct Competition {
    
}

impl Competition {

}

enum CompetitionEvent {
    
}

impl Replayable<CompetitionEvent> for Competition {
    type CommandResult = ();

    type CommandError = anyhow::Error;

    fn command(&mut self, event: &CompetitionEvent) -> Result<Self::CommandResult, Self::CommandError> {
        
        Ok(())
    }
}


struct CompetitionController {}

fn main() {
    println!("Hello, world!");
}
