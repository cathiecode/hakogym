import { RecordData } from "./store";

export function formatTimeDuration(durationMs: number): string {
  const min = Math.floor(durationMs / 1000 / 60);
  const sec = Math.floor(
    (durationMs % (1000 * 60)) / 1000
  );
  const subsec = Math.floor((durationMs % 1000) / 10)
    .toString(10)
    .padStart(2, "0");

  return `${min}:${sec}"${subsec}`;
}

export function resultListSortFunction(a: RecordData, b: RecordData) {
  if (a.state === "Removed") {
    if (b.state !== "Removed") {
      return 1;
    }
  }

  if (b.state === "Removed") {
    if (a.state !== "Removed") {
      return -1;
    }
  }

  const carIdDifference = Number(a.competition_entry_id) - Number(b.competition_entry_id)
  if (!Number.isNaN(carIdDifference) && carIdDifference !== 0) {
    return carIdDifference;
  }

  return 0;
}