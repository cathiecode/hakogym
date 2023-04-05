import { Button, Table } from "react-bootstrap";
import MetaHeaderCells from "../../../meta/component/MetaHeaderCells";
import JointMetaCell from "../../../meta/component/JointMetaCell";
import AddQueueItem from "../../../pending_car_queue/components/AddQueueItem";
import { useList } from "../../../pending_car_queue/store";
import { useRunnningObserverState } from "../../../running_observer/store";
import MetaCells from "../../../meta/component/MetaCells";
import showPromise from "../../../../ui/toast";
import QueueRow from "../QueueRow";
import classNames from "classnames/bind";

import styles from "./styles.module.css";
import Timer from "../../../../ui/Timer";
import useRecords from "../../../records/store";
import { formatDuration } from "../../../../utils/formatDuration";
import { PendingCarQueue } from "../../../../types/proto/pending_car_queue";

const cx = classNames.bind(styles);

export default function CombinedTable() {
  const { update, remove, ...pendingCarQueue } = useList();
  const { ...runningObserver } = useRunnningObserverState();
  const { ...records } = useRecords();

  const highlightPendingCarQueueHead = runningObserver.data?.item.length === 0;

  return (
    <Table hover responsive style={{ tableLayout: "fixed" }}>
      <thead>
        <tr>
          <th>ステータス</th>
          <MetaHeaderCells />
          <th>タイム</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {records.data?.item.map((item, i) => (
          <tr key={i}>
            <td>記録</td>
            <MetaCells value={item.meta} />
            <td>{formatDuration(Number(item.time))}</td>
            <td></td>
          </tr>
        ))}
        {runningObserver.data?.item.map((item, i) => (
          <tr key={i} className={cx("row--highlighted")}>
            <td>出走中</td>
            <MetaCells value={item.meta} />
            <td>
              <Timer startTimeStamp={Number(item.startAt)} />
            </td>
            <td>
              <Button variant="warning">手動ストップ</Button>
            </td>
          </tr>
        ))}
        {pendingCarQueue.data?.item.length === 0 &&
        runningObserver.data?.item.length === 0 ? (
          <tr
            className={cx({ "row--highlighted": highlightPendingCarQueueHead })}
          >
            <td>未登録</td>
            <JointMetaCell extendCol={2} />
          </tr>
        ) : null}
        {pendingCarQueue.data?.item.map((item, i) => (
          <tr
            key={item.id}
            className={cx({ "row--highlighted": i === 0 && highlightPendingCarQueueHead })}
          >
            <td>{i === 0 ? "次の出走車" : "出走待ち"}</td>
            <QueueRow
              key={item.id}
              item={item}
              onChange={(to) => showPromise(update(to), "更新")}
              onRemove={() => showPromise(remove(item.id), "削除")}
            />
          </tr>
        ))}
        <tr>
          <td>出走待ちリストに追加</td>
          <JointMetaCell extendCol={2}>
            <AddQueueItem />
          </JointMetaCell>
        </tr>
      </tbody>
    </Table>
  );
}
