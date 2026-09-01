import { formatMantraSlug } from './dashboard-formatters';
import type {
  DailyPracticeActivity,
  Mantra,
  MantraPracticeBreakdown,
} from '@devsangam/types';

export const DEFAULT_PRACTICE_TARGET = 108;

const WEEK_LENGTH = 7;

export type DistributionEntry = {
  label: string;
  chants: number;
  percentage: number;
};

export function getPercentage(value: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / target) * 100)));
}

export function getWeeklyConsistency(activity: DailyPracticeActivity[]) {
  const activeDays = activity.filter(
    (entry) => entry.chants > 0 || entry.activeDurationSeconds > 0
  ).length;

  return Math.min(100, Math.round((activeDays / WEEK_LENGTH) * 100));
}

export function buildDistributionEntries(
  breakdown: MantraPracticeBreakdown[],
  mantras: Mantra[]
): DistributionEntry[] {
  const sorted = [...breakdown].sort(
    (left, right) => right.totalChants - left.totalChants
  );

  const totalChants = sorted.reduce(
    (total, item) => total + item.totalChants,
    0
  );

  if (totalChants <= 0) {
    return [];
  }

  const primaryEntries = sorted.slice(0, 3);

  const entries = primaryEntries.map((item): DistributionEntry => {
    const mantra = mantras.find(
      (candidate) => candidate.slug === item.mantraSlug
    );

    return {
      label: mantra?.title ?? formatMantraSlug(item.mantraSlug),
      chants: item.totalChants,
      percentage: Math.round((item.totalChants / totalChants) * 100),
    };
  });

  const otherChants = sorted
    .slice(3)
    .reduce((total, item) => total + item.totalChants, 0);

  if (otherChants > 0) {
    entries.push({
      label: 'Other Mantras',
      chants: otherChants,
      percentage: Math.round((otherChants / totalChants) * 100),
    });
  }

  return entries;
}

export function createDistributionGradient(entries: DistributionEntry[]) {
  if (entries.length === 0) {
    return 'conic-gradient(var(--ds-border) 0% 100%)';
  }

  let start = 0;

  const segments = entries.map((entry, index) => {
    const end =
      index === entries.length - 1
        ? 100
        : Math.min(100, start + entry.percentage);

    const segment = `${getDistributionColor(index)} ${start}% ${end}%`;

    start = end;

    return segment;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

export function getDistributionColor(index: number) {
  switch (index) {
    case 0:
      return 'var(--ds-soft-gold)';

    case 1:
      return 'var(--ds-amber)';

    case 2:
      return 'var(--ds-gold)';

    default:
      return 'var(--ds-bronze)';
  }
}
