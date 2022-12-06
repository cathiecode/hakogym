import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { InvokeArgs } from "@tauri-apps/api/tauri";
import { useEffect } from "react";

export function useAppState<T>(queryCommand: string, options: InvokeArgs) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const listener = listen("state_changed", async (value) => {
      await queryClient.invalidateQueries();
      await queryClient.cancelQueries({ queryKey: ["get_state_tree"] });
      queryClient.setQueryData(["get_state_tree"], () => value.payload);
      console.log("payload", value.payload);
    });

    return () => {
      listener.then((unlisten) => unlisten());
    };
  }, [queryClient.setQueryData]);

  return useQuery<T>({
    queryKey: [queryCommand, options],
    queryFn: async () => JSON.parse(await invoke(queryCommand, options)),
  });
}

export function useStateTree() {
  return useAppState<StateTree>("get_state_tree", {});
}

export type TimerValue = {
  "state": {
    type: "HaveNotStarted"
  } | {
    type: "Started",
    start_date: number
  }
}

type RunningCar = {
  id: string,
  timer: TimerValue
}

type StateTree = {
  tracks: {
    [key: string]: {
      running_cars: RunningCar[],
      pending_car: RunningCar | null,
      overwrap_limit: 2
    }
  }
}
