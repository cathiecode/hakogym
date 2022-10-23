import produce, { Draft } from "immer";

type CompoetitionEventValue = {
  type: "start",
  date: Date
} | {
  type: "goal",
};

type CompetitionEventData<T> = {
  value: T;
  timestamp: Date;
  createdAt: Date;
  modifiedAt: Date;
  oldData: T[];
}

class BaseCompetitionEvent<T extends {type: string}> {
  constructor(private data: CompetitionEventData<T>) {}

  change(newData: T): BaseCompetitionEvent<T> {
    return new BaseCompetitionEvent(produce(this.data, (draft) => {
      draft.oldData.push(draft.value);
      draft.modifiedAt = new Date();
      draft.value = newData as Draft<T>;
    }));
  }

  value(): T {
    return this.data.value;
  }

  type(): string {
    return this.data.value.type;
  }
}

type CompetitionEvent = BaseCompetitionEvent<CompoetitionEventValue>;

class CompetitionEvents {
  events: CompetitionEvent[] = [];

  constructor() {
    
  }

  start() { 
    
  }
}
