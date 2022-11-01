"use strict";
(() => {
  // src/queue.ts
  var Queue = class {
    constructor(queue = []) {
      this.queue = queue;
    }
    enqueue(value) {
      return this.queue.push(value);
    }
    dequeue() {
      return this.queue.shift();
    }
    length() {
      return this.queue.length;
    }
    removeOne(condition) {
      const itemIndex = this.queue.findIndex(condition);
      if (itemIndex === -1) {
        return void 0;
      }
      return this.queue.splice(itemIndex, 1)[0];
    }
    array() {
      return this.queue;
    }
  };

  // src/index.ts
  var TimeMachine = class {
    constructor(factory, events = []) {
      this.factory = factory;
      this.events = events;
      this.currentInstance = factory();
    }
    currentErrors = [];
    currentInstance;
    lastOrderNumber = -Infinity;
    emit(type, order, ...args) {
      if (typeof order !== "number") {
        order = order.getTime();
      }
      if (order < this.lastOrderNumber) {
        this.resetErrors();
        return this.insert(type, order, args);
      } else {
        this.events.push({
          order,
          type,
          args
        });
        this.lastOrderNumber = order;
        return this.run({
          order,
          type,
          args
        });
      }
    }
    insert(type, order, args) {
      console.log("rewinding");
      this.currentInstance = this.factory();
      let inserted = false;
      let newEvents = [];
      let result = void 0;
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
    resetErrors() {
      this.currentErrors = [];
    }
    run(event) {
      try {
        return this.currentInstance[event.type].apply(this.currentInstance, event.args);
      } catch (e) {
        this.currentErrors.push({ event, error: e });
        return void 0;
      }
    }
  };
  var Timer = class {
    startDate = null;
    time = null;
    start(date) {
      if (this.startDate !== null) {
        throw new Error("\u30BF\u30A4\u30DE\u30FC\u306F\u3059\u3067\u306B\u958B\u59CB\u3055\u308C\u3066\u3044\u307E\u3059");
      }
      this.startDate = date;
    }
    stop(date) {
      if (!this.startDate) {
        throw new Error("\u30BF\u30A4\u30DE\u30FC\u304C\u958B\u59CB\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
      }
      this.time = date.getTime() - this.startDate.getTime();
      this.startDate = null;
    }
    getTime(date) {
      return this.time;
    }
    setTime(timeMs) {
      this.time = timeMs;
    }
    isRunning() {
      return this.startDate !== null;
    }
  };
  var Car = class {
    constructor(number) {
      this.number = number;
    }
    timer = new Timer();
    start(date) {
      this.timer.start(date);
    }
    stop(date) {
      this.timer.stop(date);
    }
    time(date) {
      this.timer.getTime(date);
    }
    editTime(timeMs) {
      this.timer.setTime(timeMs);
    }
    isRunning() {
      return this.timer.isRunning();
    }
  };
  var Track = class {
    constructor(overwrapLimit) {
      this.overwrapLimit = overwrapLimit;
    }
    runningCars = new Queue();
    pendingCar = null;
    registerNextCar(nextCarNumber) {
      this.pendingCar = new Car(nextCarNumber);
    }
    start(date) {
      if (!this.pendingCar) {
        throw new Error("next car is not registered");
      }
      if (this.runningCars.length() >= this.overwrapLimit) {
        throw new Error("overwrap limit is" + this.overwrapLimit);
      }
      this.pendingCar.start(date);
      this.runningCars.enqueue(this.pendingCar);
    }
    stop(date, carNumber) {
      let targetCar = void 0;
      if (carNumber === null) {
        targetCar = this.runningCars.dequeue();
      } else {
        targetCar = this.runningCars.removeOne((car) => car.number === carNumber);
      }
      if (!targetCar) {
        throw new Error("No such car");
      }
      targetCar.stop(date);
    }
  };
  var Competition = class {
    constructor(tracks) {
      this.tracks = tracks;
    }
    registerTrackPendingCar(track, carNumber) {
      this.getTrack(track).registerNextCar(carNumber);
    }
    start(date, track) {
      this.getTrack(track).start(date);
    }
    stop(date, track) {
      this.getTrack(track).stop(date);
    }
    getTrack(trackId) {
      const track = this.tracks.get(trackId);
      if (track === void 0) {
        throw new Error("No such track " + trackId);
      }
      return track;
    }
  };
  var timer = new TimeMachine(() => new Timer());
  var cs = new TimeMachine(() => new Competition(/* @__PURE__ */ new Map([["a", new Track(1)]])));
  cs.emit("start", 0, new Date(), "a");
  console.log(cs.currentErrors);
})();
