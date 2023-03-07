import { TimerValue } from "../store"
import { useInterval } from "usehooks-ts";
import { useState } from "react";
import { formatTimeDuration } from "../utils";

type TimerProps = {
  timer: TimerValue
}

export default function Timer({timer}: TimerProps) {
  const [currentDuration, setCurrentDuration] = useState(0);

  // TODO: 
  useInterval(() => {
    if (timer.state.type !== "Started") {
      return;
    }

    setCurrentDuration(Date.now() - timer.state.start_date);
  }, timer.state.type === "Started" ? 100 : null);

  switch(timer.state.type) {
    case "HaveNotStarted":
      return <div>(開始されていません)</div>
    case "Started":
      return <div>{formatTimeDuration(currentDuration)}</div>
    default:
      return <div>{formatTimeDuration(timer.state.time)}</div>
  }
}
