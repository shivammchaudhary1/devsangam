const CHANT_HAPTIC_DURATION_MS = 20;

export function supportsHaptics() {
  return (
    typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
  );
}

export function triggerChantHaptic() {
  if (!supportsHaptics()) {
    return;
  }

  navigator.vibrate(CHANT_HAPTIC_DURATION_MS);
}

export function cancelHaptic() {
  if (!supportsHaptics()) {
    return;
  }

  navigator.vibrate(0);
}
