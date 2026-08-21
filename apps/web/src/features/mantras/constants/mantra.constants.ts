export const MANTRA_CATEGORIES = [
  'All',
  'Devotion',
  'Peace',
  'Focus',
  'Healing',
  'Protection',
  'Wisdom',
] as const;

export type MantraCategory = (typeof MANTRA_CATEGORIES)[number];

export const DEFAULT_MANTRA_CATEGORY: MantraCategory = 'All';

export const MANTRA_QUERY_STALE_TIME_MS = 5 * 60 * 1000;

export const MANTRA_SEARCH_DEBOUNCE_MS = 300;
