use std::{collections::VecDeque, future::pending};

use anyhow::Result;

use chrono::{DateTime, Duration, Utc};
use thiserror::Error;

trait Replayable<Command> {
    type CommandResult;
    type CommandError;
    fn create() -> Self;
    fn command(&mut self, event: &Command) -> Result<Self::CommandResult, Self::CommandError>;
}

struct Replayer<Model, Command> {
    entity: Model,
    commands: Vec<Command>,
}

impl<Model: Replayable<Command>, Command: Ord> Replayer<Model, Command> {
    fn new() -> Replayer<Model, Command> {
        Replayer {
            entity: Model::create(),
            commands: Vec::new(),
        }
    }

    fn from_commands(commands: Vec<Command>) -> Replayer<Model, Command> {
        let mut replayer = Replayer {
            entity: Model::create(),
            commands,
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
        self.entity = Model::create();
        for command in self.commands.iter() {
            self.entity.command(command);
        }
    }
}

impl<Model, T> AsRef<Model> for Replayer<Model, T> {
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

struct Car {
    timer: Timer,
    id: CarId,
}

impl Car {
    fn new(id: CarId) -> Car {
        Car {
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

    fn time(&mut self, date: DateTime<Utc>) -> Result<Duration> {
        self.timer.get_time(date)
    }

    fn edit_time(&mut self, time: Duration) -> Result<()> {
        self.timer.set_time(time)
    }

    fn getId(&self) -> CarId {
        self.id
    }
}

struct Track {
    running_cars: VecDeque<Car>,
    pending_car: Option<Car>,
    overwrap_limit: i64,
}

impl Track {
    pub fn register_next_car(&mut self, carId: CarId) -> Result<()> {
        self.pending_car = Some(Car::new(carId));
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

    pub fn stop(&mut self, date: DateTime<Utc>, car_id: Option<CarId>) -> Result<()> {
        let (car_index, car) = if let Some(car_id) = car_id {
            self.find_running_car(car_id)?
            
        } else {
            self.running_cars.iter_mut().next().map_or(Err(AppError::TrackNobodyRunnning), |v| Ok((0 as usize, v)))?
        };

        car.stop(date)?;

        self.running_cars.remove(car_index);

        Ok(())
    }

    fn find_running_car(&mut self, car_id: CarId) -> Result<(usize, &mut Car)> {
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

fn main() {
    println!("Hello, world!");
}
