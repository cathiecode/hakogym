import { useState } from "react";
import { useInterval } from "usehooks-ts";
import { formatDuration } from "../utils/formatDuration";

type TimerProps = {
  startTimeStamp: number;
};

export default function Timer({ startTimeStamp }: TimerProps) {
    const [duration, setDuration] = useState<number>(() => Date.now() - startTimeStamp);

    useInterval(() => {
        setDuration(Date.now() - startTimeStamp);
    }, 91);


  return <div>{formatDuration(duration)}</div>
}
