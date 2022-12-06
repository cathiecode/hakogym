import { useStateTree } from "./store";
import Loader from "./components/Loader";
import { useRef } from "react";
import { createCompetition, registerNextCar, start, stop } from "./command";
import Timer from "./components/Timer";
import {Toaster} from "react-hot-toast";

import styles from "./App.module.css";

function App() {
  const stateTree = useStateTree();

  const registerPendingCarInput = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.App}>
      <Toaster />
      <Loader data={stateTree.data}>
        {(data) => (
          <div className={styles.columns}>
            <div>
              {Object.entries(data.tracks).map(([trackId, track]) => (
                <div>
                  <h2>トラック {trackId}</h2>
                  <div>同時出走制限: {track.overwrap_limit}台</div>
                  <div>
                    <h3>待機中車両</h3>
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
                          placeholder="ゼッケンID"
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
                  <button
                    onClick={() =>
                      stop({ timestamp: Date.now(), trackId: trackId })
                    }
                  >
                    最終出走をゴール
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h2>リザルト(生データ)</h2>
              <table>
                <tbody>
                  {}
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
