import { confirmationAtom, useStateTree } from "./store";
import Loader from "./components/Loader";
import { useCallback, useRef } from "react";
import {
  changeRecordDerailmentCount,
  changeRecordPylonTouchCount,
  createCompetition,
  didNotFinished,
  markDerailment,
  markDnfToRecord,
  markMisscourseToRecord,
  markPylonTouch,
  missCourse,
  recoveryRecord,
  registerNextCar,
  removeDerailment,
  removePylonTouch,
  removeRecord,
  start,
  stop,
} from "./command";
import Timer from "./components/Timer";
import { Toaster } from "react-hot-toast";

import styles from "./App.module.css";
import { formatTimeDuration, resultListSortFunction } from "./utils";
import { useAtom } from "jotai";
import ButtonWithConfirmation from "./components/ButtonWithConfirmation";
import ValueEditor from "./components/Editor";

const RECORD_STATE_MAP = {
  DidNotFinished: "DNF",
  MissCourse: "MC",
  Checkered: "記録",
  Removed: "削除",
} as Record<string, string | undefined>;

function App() {
  const stateTree = useStateTree();

  const registerPendingCarInput = useRef<HTMLInputElement>(null);

  const [confirmation, setConfirmation] = useAtom(confirmationAtom);

  const submitNextCar = (trackId: string) => (ev: any) => {
    ev.preventDefault();
    const carId = registerPendingCarInput.current?.value;
    if (registerPendingCarInput.current) {
      registerPendingCarInput.current.value = "";
    }
    if (!carId) {
      return;
    }
    registerNextCar({
      timestamp: Date.now(),
      carId: carId,
      trackId: trackId,
    });
  };

  return (
    <div className={styles.App}>
      {confirmation ? (
        <div className={styles.confirmationDialog}>
          <div className={styles.confirmationDialog__text}>
            {confirmation.message}
          </div>
          <button
            className={styles.confirmationDialog__cancel}
            onClick={() => setConfirmation(null)}
          >
            キャンセル
          </button>
          <button
            className={styles.confirmationDialog__confirm}
            onClick={() => {
              setConfirmation(null);
              confirmation.onSubmit();
            }}
          >
            実行
          </button>
        </div>
      ) : null}
      <Toaster position="bottom-right" />
      <Loader data={stateTree}>
        {(data) => (
          <div className={styles.columns}>
            <div>
              {Object.entries(data.tracks).map(([trackId, track]) => (
                <div>
                  <h2>トラック {trackId}</h2>
                  <div>同時出走制限: {track.overwrap_limit}台</div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>状態</th>
                        <th>ゼッケン</th>
                        <th>タイム(ペナルティなし)</th>
                        <th>ペナルティ</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.records)
                        .sort(([_a_id, a], [_b_id, b]) =>
                          resultListSortFunction(a, b)
                        )
                        .map(([recordId, result], i) => (
                          <tr className={styles[`record__${result.state}`]}>
                            <td>
                              {RECORD_STATE_MAP[result.state] ?? result.state}
                            </td>
                            <th>{result.competition_entry_id}</th>
                            <td>{formatTimeDuration(result.duration)}</td>
                            <td>
                              <td>
                                パイロン:
                                <ValueEditor
                                  currentValue={result.pylon_touch_count.toString(
                                    10
                                  )}
                                  onChange={(value) =>
                                    changeRecordPylonTouchCount({
                                      timestamp: Date.now(),
                                      recordId: result.id,
                                      count: Number(value),
                                    })
                                  }
                                />
                                脱輪:
                                <ValueEditor
                                  currentValue={result.derailment_count.toString(
                                    10
                                  )}
                                  onChange={(value) =>
                                    changeRecordDerailmentCount({
                                      timestamp: Date.now(),
                                      recordId: result.id,
                                      count: Number(value),
                                    })
                                  }
                                />
                              </td>
                            </td>
                            <td>
                              <ButtonWithConfirmation
                                todo={`ゼッケン番号${
                                  result.competition_entry_id
                                }の記録(${formatTimeDuration(
                                  result.duration
                                )})をMCとしてマークしようとしています。`}
                                onSubmit={() =>
                                  markMisscourseToRecord({
                                    timestamp: Date.now(),
                                    recordId: result.id,
                                  })
                                }
                              >
                                MC
                              </ButtonWithConfirmation>
                              <ButtonWithConfirmation
                                todo={`ゼッケン番号${
                                  result.competition_entry_id
                                }の記録(${formatTimeDuration(
                                  result.duration
                                )})をDNFとしてマークしようとしています。`}
                                onSubmit={() =>
                                  markDnfToRecord({
                                    timestamp: Date.now(),
                                    recordId: result.id,
                                  })
                                }
                              >
                                DNF
                              </ButtonWithConfirmation>
                              <ButtonWithConfirmation
                                todo={`ゼッケン番号${
                                  result.competition_entry_id
                                }の記録(${formatTimeDuration(
                                  result.duration
                                )})を記録から除外(削除)しようとしています。`}
                                onSubmit={() =>
                                  removeRecord({
                                    timestamp: Date.now(),
                                    recordId: result.id,
                                  })
                                }
                              >
                                削除
                              </ButtonWithConfirmation>
                              <ButtonWithConfirmation
                                todo={`ゼッケン番号${
                                  result.competition_entry_id
                                }の記録(${formatTimeDuration(
                                  result.duration
                                )})をゴール済みとしてマークしようとしています。`}
                                onSubmit={() =>
                                  recoveryRecord({
                                    timestamp: Date.now(),
                                    recordId: result.id,
                                  })
                                }
                              >
                                ゴール
                              </ButtonWithConfirmation>
                            </td>
                          </tr>
                        ))}
                      {track.running_cars.map((running_car) => (
                        <tr className={styles["row--running"]}>
                          <td>走行中</td>
                          <th>{running_car.id}</th>
                          <td>
                            <Timer timer={running_car.timer} />
                          </td>
                          <td>
                            パイロン: {running_car.touched_pylon_count}, 脱輪:{" "}
                            {running_car.derailment_count}
                          </td>
                          <td>
                            <ButtonWithConfirmation
                              todo={`走行中のゼッケン番号${running_car.id}を強制的にゴールさせようとしています。`}
                              onSubmit={() =>
                                stop({
                                  timestamp: Date.now(),
                                  trackId: trackId,
                                  carId: running_car.id,
                                })
                              }
                            >
                              手動ゴール
                            </ButtonWithConfirmation>
                            <div>
                              <ButtonWithConfirmation
                                todo={`走行中のゼッケン番号${running_car.id}をミスコースにより走行終了させようとしています。`}
                                onSubmit={() =>
                                  missCourse({
                                    timestamp: Date.now(),
                                    trackId: trackId,
                                    carId: running_car.id,
                                  })
                                }
                              >
                                MC
                              </ButtonWithConfirmation>
                              <ButtonWithConfirmation
                                todo={`走行中のゼッケン番号${running_car.id}をDNFとして走行終了させようとしています。`}
                                onSubmit={() =>
                                  didNotFinished({
                                    timestamp: Date.now(),
                                    trackId: trackId,
                                    carId: running_car.id,
                                  })
                                }
                              >
                                DNF
                              </ButtonWithConfirmation>
                            </div>
                            <div>
                              <button
                                onClick={() =>
                                  markPylonTouch({
                                    timestamp: Date.now(),
                                    trackId: trackId,
                                    carId: running_car.id,
                                  })
                                }
                              >
                                パイロン+
                              </button>
                              <button
                                onClick={() =>
                                  removePylonTouch({
                                    timestamp: Date.now(),
                                    trackId: trackId,
                                    carId: running_car.id,
                                  })
                                }
                              >
                                パイロン-
                              </button>
                            </div>
                            <div>
                              <button
                                onClick={() =>
                                  markDerailment({
                                    timestamp: Date.now(),
                                    trackId: trackId,
                                    carId: running_car.id,
                                  })
                                }
                              >
                                脱輪+
                              </button>
                              <button
                                onClick={() =>
                                  removeDerailment({
                                    timestamp: Date.now(),
                                    trackId: trackId,
                                    carId: running_car.id,
                                  })
                                }
                              >
                                脱輪-
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {track.pending_car?.id ? (
                        <tr className={styles["row--pending"]}>
                          <td>出走待機中</td>
                          <th>{track.pending_car?.id}</th>
                          <td>--</td>
                          <td>--</td>
                          <td>
                            <button
                              onClick={() =>
                                start({ timestamp: Date.now(), trackId })
                              }
                            >
                              手動スタート
                            </button>
                          </td>
                        </tr>
                      ) : null}
                      {
                        <tr>
                          <td>入力</td>
                          <th>
                            <form onSubmit={submitNextCar(trackId)}>
                              <input
                                type="text"
                                placeholder="次出走車両…"
                                ref={registerPendingCarInput}
                              />
                            </form>
                          </th>
                          <td>--</td>
                          <td>--</td>
                          <td>
                            <button onClick={submitNextCar(trackId)}>
                              待機中として登録
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}
      </Loader>
    </div>
  );
}

export default App;
