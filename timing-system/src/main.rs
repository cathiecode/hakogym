use anyhow::Error;

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
enum TimerError {
    #[error("Timer already started")]
    TimerAlreadyStarted,
    #[error("Timer have not started")]
    TimerHaveNotStarted,
}

enum TimerState {
    HaveNotStarted,
    Started { start_date: DateTime<Utc> },
    Stopped { time: Duration },
    Specified { time: Duration }
}

impl Timer {
    fn new() -> Timer {
        Timer {
            state: TimerState::HaveNotStarted,
        }
    }

    fn start(&mut self, date: DateTime<Utc>) -> Result<(), Error> {
        if let TimerState::Started { .. } = self.state {
            Err(TimerError::TimerAlreadyStarted.into())
        } else {
            self.state = TimerState::Started { start_date: date };
            Ok(())
        }
    }

    fn stop(&mut self, date: DateTime<Utc>) -> Result<(), Error> {
        if let TimerState::Started { start_date } = self.state {
            self.state = TimerState::Stopped {
                time: date - start_date,
            };
            Ok(())
        } else {
            Err(TimerError::TimerHaveNotStarted.into())
        }
    }

    fn get_time(&self, date: DateTime<Utc>) -> Result<Duration, Error> {
        match self.state {
            TimerState::HaveNotStarted => Err(TimerError::TimerHaveNotStarted.into()),
            TimerState::Started { start_date } => Ok(date - start_date),
            TimerState::Stopped { time } => Ok(time),
            TimerState::Specified {time} => Ok(time)
        }
    }

    fn set_time(&mut self, time: Duration) {
        self.state = TimerState::Specified { time: time };
    }

    fn is_running(&self) -> bool {
        if let TimerState::Started { .. } = self.state {
            true
        } else {
            false
        }
    }

}

fn main() {
    println!("Hello, world!");
}
