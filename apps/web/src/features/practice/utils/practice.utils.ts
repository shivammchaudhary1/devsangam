export function getPracticeEstimatedMinutes(
  targetCount: number,
  secondsPerChant: number | null
) {
  if (!secondsPerChant || targetCount <= 0) {
    return null;
  }

  return Math.max(1, Math.ceil((targetCount * secondsPerChant) / 60));
}
