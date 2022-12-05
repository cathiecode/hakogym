import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { useAppState } from "./store";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

function App() {
  async function createCompetition() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

    console.log(
      await invoke("create_competition", { configurationId: "test" })
    );
  }

  const state_tree = useAppState<string>("get_state_tree", {});

  const queryClient = useQueryClient();

  useEffect(() => {
    listen("state_changed", () => {
      queryClient.invalidateQueries();
    })
  }, []);

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h2>State Tree</h2>
      <pre>{state_tree.data}</pre>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="row">
        <div>
          <button type="button" onClick={() => createCompetition()}>
            Create world!
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
