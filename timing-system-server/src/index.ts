import Queue from "./queue";

type PickByValueType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type AnyFunction = (...args: any) => any;
type FunctionsOf<T> = PickByValueType<T, (...args: any) => any>;

type IsFunction<T, K extends keyof T> = T[K] extends AnyFunction ? T[K] : never;

type TimeMachineEvent<T extends {}> = {
  order: number;
  type: keyof T;
  args: Parameters<T[keyof T] extends AnyFunction ? T[keyof T] : never>;
};

class TimeMachine<T extends {}> {
  currentErrors: { event: TimeMachineEvent<T>; error: any }[] = [];
  currentInstance: T;
  lastOrderNumber: number = -Infinity;

  constructor(
    private factory: () => T,
    private events: TimeMachineEvent<T>[] = []
  ) {
    this.currentInstance = factory();
  }

  emit<K extends keyof FunctionsOf<T>>(
    type: K,
    order: number | Date,
    ...args: Parameters<IsFunction<T, K>>
  ): ReturnType<IsFunction<T, K>> | undefined {
    if (typeof order !== "number") {
      order = order.getTime();
    }
    if (order < this.lastOrderNumber) {
      this.resetErrors();
      return this.insert(type, order, args);
    } else {
      this.events.push({
        order: order,
        type: type,
        args: args,
      });

      this.lastOrderNumber = order;

      return this.run({
        order: order,
        type: type,
        args: args,
      });
    }
  }

  private insert<K extends keyof FunctionsOf<T>>(
    type: K,
    order: number,
    args: Parameters<IsFunction<T, K>>
  ): ReturnType<IsFunction<T, K>> | undefined {
    console.log("rewinding");
    this.currentInstance = this.factory();

    let inserted = false;
    let newEvents: TimeMachineEvent<T>[] = [];
    let result: ReturnType<IsFunction<T, K>> | undefined = undefined;

    for (const event of this.events) {
      if (!inserted && order < event.order) {
        console.log("...insert", order, type, args);
        newEvents.push();
        result = this.run({ order, type, args });
        inserted = true;
      }
      console.log("...replay", event.order, event.type, event.args);
      newEvents.push(event);
      this.run(event);
    }

    this.events = newEvents;

    return result;
  }

  private resetErrors() {
    this.currentErrors = [];
  }

  private run<K extends keyof T>(
    event: TimeMachineEvent<T>
  ): ReturnType<IsFunction<T, K>> | undefined {
    try {
      return (this.currentInstance[event.type] as AnyFunction).apply(this.currentInstance, event.args);
    } catch (e) {
      this.currentErrors.push({ event, error: e });
      return undefined;
    }
  }
}

class Timer {
  private startDate: Date | null = null;
  private time: number | null = null;

  start(date: Date) {
    if (this.startDate !== null) {
      throw new Error("タイマーはすでに開始されています");
    }
    this.startDate = date;
  }

  stop(date: Date) {
    if (!this.startDate) {
      throw new Error("タイマーが開始されていません");
    }

    this.time = date.getTime() - this.startDate.getTime();
    this.startDate = null;
  }

  getTime(date: Date): number | null {
    return this.time;
  }

  setTime(timeMs: number) {
    this.time = timeMs;
  }

  isRunning() {
    return this.startDate !== null;
  }
}

class Car {
  timer: Timer = new Timer();
  constructor(public number: number) {
    
  }

  start(date: Date) {
    this.timer.start(date);
  }

  stop(date: Date) {
    this.timer.stop(date);
  }

  time(date: Date) {
    this.timer.getTime(date);
  }

  editTime(timeMs: number) {
    this.timer.setTime(timeMs);
  }

  isRunning() {
    return this.timer.isRunning();
  }
}

class Track {
  runningCars = new Queue<Car>();
  pendingCar: Car | null  = null;

  constructor(private overwrapLimit: number) {}

  registerNextCar(nextCarNumber: number) {
    this.pendingCar = new Car(nextCarNumber);
  }

  start(date: Date) {
    if (!this.pendingCar) {
      throw new Error("next car is not registered");
    }
    if (this.runningCars.length() >= this.overwrapLimit) {
      throw new Error("overwrap limit is" + this.overwrapLimit);
    }
    this.pendingCar.start(date);
    this.runningCars.enqueue(this.pendingCar);
  }

  stop(date: Date, carNumber?: number) {
    let targetCar: Car | undefined = undefined;
    if (carNumber === null) {
      targetCar = this.runningCars.dequeue();
    } else {
      targetCar = this.runningCars.removeOne(car => car.number === carNumber);
    }

    if (!targetCar) {
      throw new Error("No such car");
    }

    targetCar.stop(date);
  }
}

class Competition {
  constructor(private tracks: Map<string, Track>) {}

  registerTrackPendingCar(track: string, carNumber: number) {
    this.getTrack(track).registerNextCar(carNumber);
  }

  start(date: Date, track: string) {
    this.getTrack(track).start(date);
  }

  stop(date: Date, track: string) {
    this.getTrack(track).stop(date);
  }

  getTracks(date: Date): string {
    return [...this.tracks.entries()]
  }

  private getTrack(trackId: string): Track {
    const track = this.tracks.get(trackId);
    if (track === undefined) {
      throw new Error("No such track " + trackId);
    }

    return track;
  }
}

const timer = new TimeMachine(() => new Timer());

const cs = new TimeMachine(() => new Competition(new Map([["a", new Track(1)]])));

cs.emit("start", 0, new Date(), "a");

console.log(cs.currentErrors);

export {}
