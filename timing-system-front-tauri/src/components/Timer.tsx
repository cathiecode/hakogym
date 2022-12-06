import { TimerValue } from "../store"
import {useInterval } from "usehooks-ts";
import { useState } from "react";

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
      return <div>Pending...</div>
    case "Started":
      return <div>{Math.floor(currentDuration / 1000 / 60)}:{Math.floor(currentDuration % (1000 * 60) / 1000)}"{Math.floor((currentDuration % 1000) / 10).toString(10).padStart(2, "0")}</div>
  }
}
