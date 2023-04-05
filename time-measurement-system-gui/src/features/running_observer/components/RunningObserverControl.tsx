import { Button, Card } from "react-bootstrap";
import { useRunnningObserverState } from "../store";
import showPromise from "../../../ui/toast";
import RunningObserverRunningCarControl from "./RunningObserverRunningCarControl";

export default function RunningObserverControl() {
  const { forceStart, forceStop, ...swr } = useRunnningObserverState();
  return (
    <div>
      {swr.data?.item.length === 0 ? (
        <RunningObserverRunningCarControl item={undefined} />
      ) : null}
      {swr.data?.item.map((item) => (
        <RunningObserverRunningCarControl key={item.id} item={item} />
      ))}
      <Card className="mb-3">
        <Card.Header>自動コントロール</Card.Header>
        <Card.Body>
          <Button
            variant="warning"
            onClick={() => {
              showPromise(forceStart(), "手動スタート");
            }}
            className="m-1"
          >
            手動スタート
          </Button>
          <Button
            variant="warning"
            onClick={() => {
              showPromise(forceStop(), "手動ゴール");
            }}
            className="m-1"
          >
            手動ストップ
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
