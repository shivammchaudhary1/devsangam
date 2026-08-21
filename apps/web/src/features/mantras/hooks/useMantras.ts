import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMantras, type GetMantrasParams } from '../api/mantra.api';

import { mantraQueryKeys } from '../api/mantra.query-keys';

import { MANTRA_QUERY_STALE_TIME_MS } from '../constants/mantra.constants';

export function useMantras(params: GetMantrasParams = {}) {
  return useQuery({
    queryKey: mantraQueryKeys.list(params),

    queryFn: () => getMantras(params),

    staleTime: MANTRA_QUERY_STALE_TIME_MS,

    placeholderData: keepPreviousData,
  });
}
