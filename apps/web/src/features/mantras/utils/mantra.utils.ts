export function getEstimatedChantMinutes(
  target: number,
  secondsPerChant: number | null
) {
  if (!secondsPerChant) {
    return null;
  }

  return Math.max(1, Math.ceil((target * secondsPerChant) / 60));
}
