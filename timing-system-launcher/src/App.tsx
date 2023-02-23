import { useEffect, useState } from "react";

import { emit, listen } from "@tauri-apps/api/event";
import { toast, Toaster } from "react-hot-toast";

import styles from "./App.module.css";

const SERVICES = ["Test"] as const;

const StatusIcon = {
  Spawned: <span className={`${styles.statusIcon} ${styles.spawned}`}></span>,
  Exited: <span className={`${styles.statusIcon} ${styles.exited}`}></span>,
  unknown: <span className={`${styles.statusIcon} ${styles.exited}`}></span>,
};

function App() {
  const [serviceState, setServiceState] = useState<
    Record<typeof SERVICES[number], "Spawned" | "Exited" | undefined>
  >({} as any);

  useEffect(() => {
    const unlisten = listen("service_event", (event) => {
      const payload = event.payload as {
        service: string;
        type: "Spawned" | "Exited";
      };
      toast(`${payload.service}: ${payload.type}`);
      setServiceState((current) => ({
        ...current,
        [payload.service]: payload.type,
      }));
    });

    return () => {
      (async () => {
        (await unlisten)();
      })();
    };
  });

  return (
    <div className={styles.App}>
      <Toaster position="bottom-left" />

      <h1>計時サブシステムステータス</h1>

      <table className={styles.statusTable}>
        <tbody>
          {SERVICES.map((serviceName, i) => (
            <tr key={i}>
              <th>{serviceName}</th>
              <td>
                {StatusIcon[serviceState[serviceName] ?? "unknown"]}
                {serviceState[serviceName] ?? "UNKNOWN"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
