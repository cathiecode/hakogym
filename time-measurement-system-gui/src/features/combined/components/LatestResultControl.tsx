import { Card } from "react-bootstrap";
import useRecords from "../../records/store";
import { useRunnningObserverState } from "../../running_observer/store";
import { formatDuration } from "../../../utils/formatDuration";
import Timer from "../../../ui/Timer";
import classNames from "classnames";

export default function LatestResultControl() {
  const runningObserver = useRunnningObserverState();
  const records = useRecords();

  let state = "待機";
  runningObserver.data?.item[0]?.startAt ? "計測中" : "待機";

  if (!runningObserver.data) {
    state = "読み込み中";
  }

  if (runningObserver.data?.item[0]?.startAt) {
    state = "計測中";
  }

  if (runningObserver.data && runningObserver.data.item.length > 1) {
    state = "重複出走";
  }

  const time = runningObserver.data?.item[0]?.startAt ? (
    <Timer startTimeStamp={Number(runningObserver.data?.item[0]?.startAt)} />
  ) : records.data && records.data.item[records.data.item.length - 1]?.time ? (
    formatDuration(
      Number(records.data.item[records.data.item.length - 1]?.time)
    )
  ) : (
    formatDuration(0)
  );
  return (
    <Card className="mb-3">
      <Card.Header>状態</Card.Header>
      <Card.Body>
        <div
          className={classNames("fs-1 text-center", {
            "text-bg-secondary": state === "待機",
            "text-bg-info": state === "計測中" || state === "重複出走",
          })}
        >
          {state}
        </div>
        <div className={classNames("fs-2 text-center")}>{time}</div>
      </Card.Body>
    </Card>
  );
}
