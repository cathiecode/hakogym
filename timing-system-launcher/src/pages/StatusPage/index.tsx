import { useEffect, useState } from "react";

import { emit, listen } from "@tauri-apps/api/event";
import { toast, Toaster } from "react-hot-toast";

import styles from "./App.module.css";
import { invoke } from "@tauri-apps/api";

const StatusIcon = {
  Spawned: <span className={`${styles.statusIcon} ${styles.spawned}`}></span>,
  Exited: <span className={`${styles.statusIcon} ${styles.exited}`}></span>,
  unknown: <span className={`${styles.statusIcon} ${styles.unknown}`}></span>,
};

export default function StatusPage() {
  const [services, setServices] = useState(new Map<string, "Spawned" | "Exited">());

  useEffect(() => {
    const unlisten = listen("service_event", (event) => {
      const payload = event.payload as {
        service: string;
        type: "Spawned" | "Exited";
      } | {type: "Message", service: string, message: string};
      toast(`${payload.service}: ${payload.type}${payload.type === "Message" ? payload.message : ""}`);

      if (payload.type === "Spawned" || payload.type === "Exited") {
        setServices(current => new Map([...current, [payload.service, payload.type]]));
      }
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
          {[...services.entries()].map(([serviceName, serviceStatus], i) => (
            <tr key={i}>
              <th>{serviceName}</th>
              <td>
                {StatusIcon[serviceStatus ?? "unknown"]}
                {serviceStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
