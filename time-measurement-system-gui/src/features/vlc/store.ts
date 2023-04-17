import { createUseServiceStatus } from "../service_manager/store";

export const useVLCStatus = createUseServiceStatus(
  "time-measurement-system-vlc-connection",
  () => undefined
);
