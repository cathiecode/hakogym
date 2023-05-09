import { Button, Card } from "react-bootstrap";
import { useRunnningObserverState } from "../store";
import showPromise from "../../../ui/toast";
import RunningObserverRunningCarControl from "./RunningObserverRunningCarControl";
import { Item } from "../../../types/proto/running_observer";
import { useEffect, useState } from "react";
import { s } from "@tauri-apps/api/app-373d24a3";

export default function RunningObserverControl() {
  const { forceStart, forceStop, ...swr } = useRunnningObserverState();

  const [lastData, setLastData] = useState<Item>();

  return (
    <div>
      {swr.data?.item.length === 0 ? (
        <RunningObserverRunningCarControl item={lastData} />
      ) : null}
      {swr.data?.item.map((item) => (
        <RunningObserverRunningCarControl key={item.id} item={item} />
      ))}
      <Card className="mb-3">
        <Card.Header>手動操作</Card.Header>
        <Card.Body>
          <details>
            <summary>開く</summary>
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
          </details>
        </Card.Body>
      </Card>
    </div>
  );
}
