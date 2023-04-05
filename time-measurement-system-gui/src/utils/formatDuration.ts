export function formatDuration(durationMs: number): string {
  const min = Math.floor(durationMs / 1000 / 60);
  const sec = Math.floor((durationMs % (1000 * 60)) / 1000);
  const subsec = Math.floor((durationMs % 1000) / 10)
    .toString(10)
    .padStart(2, "0");

  return `${min}:${sec}"${subsec}`;
}
