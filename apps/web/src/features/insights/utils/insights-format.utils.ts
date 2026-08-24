import type { InsightsRange } from '@devsangam/types';

const INSIGHTS_NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatInsightsNumber(value: number) {
  return INSIGHTS_NUMBER_FORMATTER.format(value);
}

export function formatInsightsDuration(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return '0s';
  }

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
}

export function getInsightsRangeLabel(range: InsightsRange) {
  switch (range) {
    case '7d':
      return 'Last 7 days';

    case '30d':
      return 'Last 30 days';

    case '90d':
      return 'Last 90 days';

    case 'all':
      return 'All time';
  }
}
