import { useStateTree } from "../store";
import { createCompetition, registerNextCar, start, stop } from "../command";

export default function Debug() {
  const stateTree = useStateTree();

  return (
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
        <code>{JSON.stringify(stateTree, null, "  ")}</code>
      </pre>
    </details>
  );
}
