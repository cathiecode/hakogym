import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { InvokeArgs } from "@tauri-apps/api/tauri";
import { atom } from "jotai";
import { useEffect, useState } from "react";

export function useAppState<T>(queryCommand: string, options: InvokeArgs) {
  const queryClient = useQueryClient();

  const query = useQuery<T>({
    queryKey: [queryCommand, options],
    queryFn: async () => JSON.parse(await invoke(queryCommand, options)),
  });

  useEffect(() => {}, [queryClient.setQueryData]);

  return query;
}

export function useStateTree() {
  const [state, setState] = useState<StateTree | null>();

  useEffect(() => {
    invoke("get_state_tree", {}).then((result) =>
      setState(JSON.parse(result as string) as StateTree)
    );

    const listener = listen("state_changed", async (value) => {
      console.log(value);
      setState(JSON.parse(value.payload as string) as StateTree);
    });

    return () => {
      listener.then((unlisten) => unlisten());
    };
  }, []);

  return state;
}

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
  touched_pylon_count: number,
  derailment_count: number
};

export type RecordData = {
  id: string;
  state: string;
  duration: number;
  competition_entry_id: string;
  pylon_touch_count: number,
  derailment_count: number,
  record_type: string
}

export type StateTree = {
  tracks: {
    [key: string]: {
      running_cars: RunningCar[];
      pending_car: RunningCar | null;
      overwrap_limit: 2;
      record_type: string
    };
  };
  records: {
    [recordId: string]: RecordData;
  };
};


export const confirmationAtom = atom<{message: string, onSubmit: () => void} | null>(null);