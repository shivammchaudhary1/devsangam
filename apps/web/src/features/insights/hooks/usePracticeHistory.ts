import { getPracticeHistory } from '../api/insights.api';
import { insightsQueryKeys } from '../api/insights.query-keys';
import type { PracticeHistoryFilters } from '@devsangam/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const DEFAULT_PAGE = 1;

const DEFAULT_LIMIT = 20;

export function usePracticeHistory(filters: PracticeHistoryFilters = {}) {
  const normalizedFilters = useMemo<PracticeHistoryFilters>(
    () => ({
      page: filters.page ?? DEFAULT_PAGE,

      limit: filters.limit ?? DEFAULT_LIMIT,

      mantraSlug: filters.mantraSlug,

      status: filters.status,

      startDate: filters.startDate,

      endDate: filters.endDate,

      timezone: filters.timezone,
    }),
    [
      filters.page,
      filters.limit,
      filters.mantraSlug,
      filters.status,
      filters.startDate,
      filters.endDate,
      filters.timezone,
    ]
  );

  return useQuery({
    queryKey: insightsQueryKeys.history(normalizedFilters),

    queryFn: () => getPracticeHistory(normalizedFilters),

    staleTime: 30_000,

    placeholderData: keepPreviousData,
  });
}
