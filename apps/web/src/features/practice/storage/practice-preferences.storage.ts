export type PracticePreferences = {
  omEnabled: boolean;
  omVolume: number;
  toneEnabled: boolean;
  toneVolume: number;
  hapticEnabled: boolean;
};

export type StoredPracticePreferences = Partial<PracticePreferences>;

const STORAGE_PREFIX = 'devsangam.practice.preferences';

function getStorageKey(userId?: string) {
  if (!userId) {
    return null;
  }

  return `${STORAGE_PREFIX}.${userId}`;
}

export function readPracticePreferences(
  userId?: string
): StoredPracticePreferences {
  if (typeof window === 'undefined') {
    return {};
  }

  const key = getStorageKey(userId);

  if (!key) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const result: StoredPracticePreferences = {};

    if (typeof parsed.omEnabled === 'boolean') {
      result.omEnabled = parsed.omEnabled;
    }

    if (isVolume(parsed.omVolume)) {
      result.omVolume = parsed.omVolume;
    }

    if (typeof parsed.toneEnabled === 'boolean') {
      result.toneEnabled = parsed.toneEnabled;
    }

    if (isVolume(parsed.toneVolume)) {
      result.toneVolume = parsed.toneVolume;
    }

    if (typeof parsed.hapticEnabled === 'boolean') {
      result.hapticEnabled = parsed.hapticEnabled;
    }

    return result;
  } catch {
    window.localStorage.removeItem(key);

    return {};
  }
}

export function writePracticePreferences(
  userId: string | undefined,
  changes: StoredPracticePreferences
) {
  if (typeof window === 'undefined') {
    return;
  }

  const key = getStorageKey(userId);

  if (!key) {
    return;
  }

  try {
    const existing = readPracticePreferences(userId);

    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...existing,
        ...changes,
      })
    );
  } catch {
    /*
     * Preferences are optional.
     * Practice must continue even when
     * localStorage is unavailable.
     */
  }
}

function isVolume(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}
