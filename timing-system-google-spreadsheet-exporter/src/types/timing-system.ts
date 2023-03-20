export type TimerValue = {
  state:
    | {
        type: "HaveNotStarted";
      }
    | {
        type: "Started";
        start_date: number;
      }
    | {
        type: "";
        time: number;
      };
};

export type RunningCar = {
  id: string;
  timer: TimerValue;
  touched_pylon_count: number;
  derailment_count: number;
};

export type RecordData = {
  id: string;
  state: string;
  duration: number;
  competition_entry_id: string;
  pylon_touch_count: number;
  derailment_count: number;
};

export type StateTree = {
  tracks: {
    [key: string]: {
      running_cars: RunningCar[];
      pending_car: RunningCar | null;
      overwrap_limit: 2;
    };
  };
  records: {
    [recordId: string]: RecordData;
  };
};
