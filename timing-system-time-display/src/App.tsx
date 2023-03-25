import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import styles from "./App.module.css";
import { useStateTree } from "./store";
import { fromUnixTime, isAfter } from "date-fns";
import { useInterval } from "usehooks-ts";
import { formatTimeDuration } from "./utils";

function App() {
  const stateTree = useStateTree();

  // FIXME: ここら辺をコンポーネントにして複数トラック・複数車に対応させる
  const [timerState, setTimerState] = useState<
    | {
        type: "running";
        startTimeStampMS: number;
      }
    | {
        type: "finished";
        time: number;
      }
  >();

  useEffect(() => {
    if (!stateTree) {
      setTimerState({type: "finished", time: 0});
      return;
    }

    if (stateTree.tracks?.[0]?.running_cars?.[0]?.timer.state.type === "Started") {
      const date = stateTree.tracks?.[0]?.running_cars?.[0]?.timer.state.start_date;

      setTimerState({ type: "running", startTimeStampMS: date });
    } else {
      setTimerState({
        type: "finished",
        time: Object.values(stateTree.records).reduce((prev, current) =>
          isAfter(current.timestamp, prev.timestamp) ? current : prev
        ).duration ?? 0,
      });
    }
  }, [stateTree]);

  const [time, setTime] = useState(0);

  useInterval(() => {
    switch (timerState?.type) {
      case "running":
        setTime(Date.now() - timerState.startTimeStampMS);
        return;
      case "finished":
        setTime(timerState.time);
    }
  }, timerState?.type === "running" ? 100 : null);

  return (
    <div className={styles.container}>
      <div className={styles.time}>
        {formatTimeDuration(time)}
      </div>
    </div>
  );
}

export default App;
