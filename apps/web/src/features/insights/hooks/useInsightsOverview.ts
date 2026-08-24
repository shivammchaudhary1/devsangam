import { getInsightsOverview } from '../api/insights.api';
import { insightsQueryKeys } from '../api/insights.query-keys';
import type { InsightsOverviewQuery } from '@devsangam/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const DEFAULT_RANGE = '7d';

export function useInsightsOverview(params: InsightsOverviewQuery = {}) {
  const normalizedParams = useMemo<InsightsOverviewQuery>(
    () => ({
      range: params.range ?? DEFAULT_RANGE,
      timezone: params.timezone,
    }),
    [params.range, params.timezone]
  );

  return useQuery({
    queryKey: insightsQueryKeys.overview(normalizedParams),

    queryFn: () => getInsightsOverview(normalizedParams),

    staleTime: 30_000,

    placeholderData: keepPreviousData,
  });
}
