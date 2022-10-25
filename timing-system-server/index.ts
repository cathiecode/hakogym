import produce, { Draft } from "immer";
import {isAfter} from "date-fns";

class Queue<T> {
  constructor(private queue: T[] = []) {}

  enqueue(value: T) {
    return this.queue.push(value);
  }

  dequeue(value: T): T | undefined {
    return this.queue.shift();
  }

  length(): number {
    return this.queue.length;
  }

  array() {
    return this.queue;
  }
}

type CompetitionEventValue =
  | {
      type: "start";
      entryId: string;
    }
  | {
      type: "goal";
      entryId: string | null;
    };

type CompetitionEventData<T> = {
  value: T;
  timestamp: Date;
  createdAt: Date;
  modifiedAt: Date;
  oldData: T[];
};

class BaseCompetitionEvent<T extends { type: string }> {
  protected constructor(private data: CompetitionEventData<T>) {}

  value(): Readonly<T> {
    return this.data.value;
  }

  timestamp(): Date {
    return this.data.timestamp;
  }

  protected change(newData: T, date: Date): BaseCompetitionEvent<T> {
    return new BaseCompetitionEvent(
      produce(this.data, (draft) => {
        draft.oldData.push(draft.value);
        draft.modifiedAt = date;
        draft.value = newData as Draft<T>;
      })
    );
  }
}

class CompetitionEvent extends BaseCompetitionEvent<CompetitionEventValue> {
  static create(value: CompetitionEventValue, date: Date) {
    return new CompetitionEvent({
      value,
      timestamp: date,
      createdAt: date,
      modifiedAt: date,
      oldData: [],
    });
  }
}

class Competition {
  private competitionEvent: CompetitionEvent[] = [];

  start(entryId: string, date: Date) {
    this.competitionEvent.push(
      CompetitionEvent.create(
        {
          type: "start",
          entryId
        },
        date
      )
    );
  }

  goal(date: Date) {
    this.competitionEvent.push(
      CompetitionEvent.create(
        {
          type: "goal",
          entryId: null
        },
        date
      )
    );
  }

  getRunningCar(date: Date) {
    const runningCarQueue = new Queue();

    for (const event of this.competitionEvent) {
      const eventValue = event.value();

      if (isAfter(event.timestamp(), date)) {
        break;
      }

      switch(eventValue.type) {
        case "start":
          runningCarQueue.enqueue(eventValue.entryId);
          break;
        case "goal":
          runningCarQueue.dequeue(eventValue.entryId);
          break;
        default:
          break;
      }
    }

    return runningCarQueue.array();
  }
}
