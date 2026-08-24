export const MALA_SIZE = 108;

export const BEAD_COUNT = 36;

export const SERVER_SYNC_INTERVAL_MS = 15_000;

export function formatPracticeDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

export function formatShortPracticeDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
