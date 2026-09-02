import { getMantras, type GetMantrasParams } from '../api/mantra.api';
import { mantraQueryKeys } from '../api/mantra.query-keys';
import { MANTRA_QUERY_STALE_TIME_MS } from '../constants/mantra.constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type UseMantrasOptions = {
  enabled?: boolean;
};

export function useMantras(
  params: GetMantrasParams = {},
  options: UseMantrasOptions = {}
) {
  return useQuery({
    queryKey: mantraQueryKeys.list(params),

    queryFn: () => getMantras(params),

    enabled: options.enabled ?? true,

    staleTime: MANTRA_QUERY_STALE_TIME_MS,

    placeholderData: keepPreviousData,
  });
}
