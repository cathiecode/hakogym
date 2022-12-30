import { useStateTree } from "./store";
import Loader from "./components/Loader";
import { useRef } from "react";
import { createCompetition, registerNextCar, start, stop } from "./command";
import Timer from "./components/Timer";
import { Toaster } from "react-hot-toast";

import styles from "./App.module.css";
import { formatTimeDuration } from "./utils";
import { useEntryList } from "./hooks";

function App() {
  const stateTree = useStateTree();

  const registerPendingCarInput = useRef<HTMLInputElement>(null);

  const entryList = useEntryList("competitionId");

  return (
    <div className={styles.App}>
      <Toaster position="bottom-right" />
      <Loader data={stateTree.data}>
        {(data) => (
          <div className={styles.columns}>
            <div>
              {Object.entries(data.tracks).map(([trackId, track]) => (
                <div>
                  <h2>トラック {trackId}</h2>
                  <div>同時出走制限: {track.overwrap_limit}台</div>
                  <div>
                    <h3>出走待機中車両</h3>
                    {track.pending_car !== null ? (
                      <span>
                        <div>ゼッケン #{track.pending_car.id}</div>
                        <button
                          onClick={() =>
                            start({ timestamp: Date.now(), trackId })
                          }
                        >
                          手動スタート
                        </button>
                      </span>
                    ) : (
                      <span>
                        <input
                          type="text"
                          placeholder="ゼッケン #"
                          ref={registerPendingCarInput}
                        />
                        <button
                          onClick={() => {
                            const carId =
                              registerPendingCarInput.current?.value;
                            if (!carId) {
                              return;
                            }
                            registerNextCar({
                              timestamp: Date.now(),
                              carId: carId,
                              trackId: trackId,
                            });
                          }}
                        >
                          待機中として登録
                        </button>
                      </span>
                    )}
                  </div>

                  <h3>出走中車両</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>ゼッケン</th>
                        <th>タイム</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {track.running_cars.map((running_car) => (
                        <tr>
                          <th>#{running_car.id}</th>
                          <td>
                            <Timer timer={running_car.timer} />
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                stop({
                                  timestamp: Date.now(),
                                  trackId: trackId,
                                  carId: running_car.id,
                                })
                              }
                            >
                              ゴール
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr />
                  <button
                    onClick={() =>
                      stop({ timestamp: Date.now(), trackId: trackId })
                    }
                  >
                    ゴール（自動順序）
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h2>リザルト(生データ)</h2>
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((result, i) => (
                    <tr>
                      <th>{i}</th>
                      <td>{result.car_id}</td>
                      <td>{formatTimeDuration(result.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Loader>
      <hr />
      <details>
        <summary>デバッグ</summary>
        <h3>コマンド</h3>
        <button
          onClick={() =>
            createCompetition({
              configurationId:
                "TODO/backend_does_nothing_according_to_this_value",
            })
          }
        >
          CreateCompetition
        </button>
        <h3>ステートツリー</h3>
        <pre>
          <code>{JSON.stringify(stateTree.data, null, "  ")}</code>
        </pre>
      </details>
    </div>
  );
}

export default App;
