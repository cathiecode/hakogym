import { useStateTree } from "../store";
import { createCompetition, registerNextCar, start, stop } from "../command";
import { useState } from "react";
import ButtonWithConfirmation from "./ButtonWithConfirmation";

export default function Debug() {
  const stateTree = useStateTree();
  const [debugOpen, setDebugOpen] = useState(false);

  const onDebugClicked = () => {
    if (debugOpen) {
      setDebugOpen(false);
    } else {
    }
  };

  return (
    <div style={{ marginTop: "100px" }}>
      {debugOpen ? (
        <button onClick={() => setDebugOpen(false)}>
          システム操作を閉じる
        </button>
      ) : (
        <ButtonWithConfirmation
          onSubmit={() => setDebugOpen(true)}
          todo="システム操作メニューを開こうとしています。必要な時以外に開かないでください。"
        >
          システム操作
        </ButtonWithConfirmation>
      )}
      {debugOpen ? (
        <div style={{backgroundColor: "#f99", padding: "8px"}}>
          <h3>コマンド</h3>
          <ButtonWithConfirmation
            onSubmit={() =>
              createCompetition({
                configurationId:
                  "TODO/backend_does_nothing_according_to_this_value",
              })
            }
            todo="競技記録を初期化します。よろしいですか?"
          >
            競技記録を初期化
          </ButtonWithConfirmation>
          <details>
            <summary>デバッグ情報</summary>
            <h3>ステートツリー</h3>
            <pre>
              <code>{JSON.stringify(stateTree, null, "  ")}</code>
            </pre>
          </details>
        </div>
      ) : null}
    </div>
  );
}
