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
