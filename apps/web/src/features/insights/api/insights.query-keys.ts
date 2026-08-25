import type {
  InsightsOverviewQuery,
  PracticeHistoryFilters,
} from '@devsangam/types';

export const insightsQueryKeys = {
  all: ['insights'] as const,

  overviews: () => [...insightsQueryKeys.all, 'overview'] as const,

  overview: (params: InsightsOverviewQuery) =>
    [...insightsQueryKeys.overviews(), params] as const,

  histories: () => [...insightsQueryKeys.all, 'history'] as const,

  history: (filters: PracticeHistoryFilters) =>
    [...insightsQueryKeys.histories(), filters] as const,
};
