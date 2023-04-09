import { useCallback, useRef } from "react";
import { formatDuration } from "../utils/formatDuration";
import useAnimationFrame from "../hooks/useAnimationFrame";

type TimerProps = {
  startTimeStamp: number;
};

export default function Timer({ startTimeStamp }: TimerProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const onAnimationFrame = useCallback(() => {
    if (wrapperRef.current) {
      wrapperRef.current.textContent = formatDuration(
        Date.now() - startTimeStamp
      );
    }
  }, [startTimeStamp]);

  useAnimationFrame(onAnimationFrame);

  return <span ref={wrapperRef}>{formatDuration(0)}</span>;
}
