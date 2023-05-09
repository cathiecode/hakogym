import { Alert, Button, Table } from "react-bootstrap";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Loader from "../../../../ui/Loader";
import { ReactElement } from "react";
import Loading from "../../../../ui/Loading";
import Confirm from "../../../../ui/Confirm";

const cx = classNames.bind(styles);

const JointRow = (props: { children: ReactElement }) => (
  <tr>
    <JointMetaCell extendCol={3}>{props.children}</JointMetaCell>
  </tr>
);

const LoadingRow = () => (
  <JointRow>
    <Loading />
  </JointRow>
);
const ErrorRow = (error: unknown) => (
  <JointRow>
    <Alert variant="danger">
      データのロードに失敗しました。(e: {`${error}`})
      <Button
        onClick={() => {
          location.reload();
        }}
        variant="secondary"
      >
        再読み込み
      </Button>
    </Alert>
  </JointRow>
);

export default function CombinedTable() {
  const pendingCarQueue = useList();
  const runningObserver = useRunnningObserverState();
  const records = useRecords();

  const highlightPendingCarQueueHead = runningObserver.data?.item.length === 0;

  return (
    <Table
      className={cx("table")}
      hover
      bordered
      style={{ tableLayout: "fixed" }}
      size="sm"
    >
      <thead>
        <tr>
          <th>ステータス</th>
          <MetaHeaderCells />
          <th>タイム</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <Loader
          data={records.data}
          error={records.error}
          loadingRender={<LoadingRow />}
          errorRender={ErrorRow}
        >
          {(data) =>
            data.item.map((item, i) => (
              <tr key={i}>
                <td>記録</td>
                <MetaCells
                  value={item.meta}
                  onChange={(meta) =>
                    showPromise(
                      records.updateMetadata(item.id, meta),
                      "記録を編集"
                    )
                  }
                />
                <td>{formatDuration(Number(item.time))}</td>
                <td>
                  <Confirm
                    message={"記録を削除します。よろしいですか？"}
                    onConfirmed={() => {
                      records.remove(item.id);
                    }}
                  >
                    {(props) => (
                      <Button variant="danger" {...props}>
                        削除
                      </Button>
                    )}
                  </Confirm>
                </td>
              </tr>
            ))
          }
        </Loader>
      </tbody>
      <tbody className={cx("highlighted")}>
        <Loader
          data={runningObserver.data}
          error={runningObserver.error}
          loadingRender={<LoadingRow />}
          errorRender={ErrorRow}
        >
          {(data) =>
            data.item.map((item, i) => (
              <tr key={i}>
                <td>出走中</td>
                <MetaCells
                  value={item.meta}
                  onChange={(meta) =>
                    showPromise(
                      runningObserver.updateMetadata(item.id, meta),
                      `出走中車両を編集`
                    )
                  }
                />
                <td>
                  <Timer startTimeStamp={Number(item.startAt)} />
                </td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => runningObserver.forceStop(item.id)}
                  >
                    手動ストップ
                  </Button>
                </td>
              </tr>
            ))
          }
        </Loader>
      </tbody>
      <tbody>
        {pendingCarQueue.data?.item.length === 0 &&
        runningObserver.data?.item.length === 0 ? (
          <tr className={cx({ highlighted: highlightPendingCarQueueHead })}>
            <td>次の出走車</td>
            <JointMetaCell extendCol={2}>
              <Alert variant="secondary" className="mb-0">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="me-2"
                />
                次の出走車両が登録されていません。ゼッケンなしで出走します。
              </Alert>
            </JointMetaCell>
          </tr>
        ) : null}
        <Loader
          data={pendingCarQueue.data}
          error={pendingCarQueue.error}
          loadingRender={<LoadingRow />}
          errorRender={ErrorRow}
        >
          {(data) =>
            data.item.map((item, i) => (
              <tr
                key={item.id}
                className={cx({
                  highlighted: i === 0 && highlightPendingCarQueueHead,
                })}
              >
                <td>{i === 0 ? "次の出走車" : "出走待ち"}</td>
                <QueueRow
                  key={item.id}
                  item={item}
                  onChange={(to) =>
                    showPromise(pendingCarQueue.update(to), "更新")
                  }
                  onRemove={() =>
                    showPromise(pendingCarQueue.remove(item.id), "削除")
                  }
                />
              </tr>
            ))
          }
        </Loader>
        <tr>
          <td>(追加)</td>
          <JointMetaCell extendCol={2}>
            <AddQueueItem />
          </JointMetaCell>
        </tr>
      </tbody>
    </Table>
  );
}
