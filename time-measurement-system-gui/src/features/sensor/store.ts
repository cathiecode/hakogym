import useSWR from "swr";
import { invoke } from "@tauri-apps/api";
import { createUseServiceStatus } from "../service_manager/store";

export const useSensorStatus = createUseServiceStatus(
  "sensor",
  (arg: { baud?: number; com: string }) => [
    "--config",
    "config.json",
    "--com",
    arg.com,
    ...(arg.baud ? ["--baud", arg.baud.toString(10)] : []),
  ]
);

export const useSensorSources = () => {
  return useSWR(["sensor", "sources"], () => invoke<string[]>("get_com_list"), {
    refreshInterval: 3000
  });
}