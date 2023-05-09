import { createUseServiceStatus } from "../service_manager/store";

export const useSpreadSheetStatus = createUseServiceStatus(
  "google-spreadsheet-sync",
  (arg: { spreadSheetId: string, startRow?: string }) => [
    "time-measurement-system-google-spreadsheet-sync/index.cjs",
    "secrets/google-api-secret.json",
    arg.spreadSheetId,
    arg.startRow || "A1"
  ]
);
