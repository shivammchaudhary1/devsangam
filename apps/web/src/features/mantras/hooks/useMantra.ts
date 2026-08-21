import { useQuery } from '@tanstack/react-query';

import { getMantraBySlug } from '../api/mantra.api';

import { mantraQueryKeys } from '../api/mantra.query-keys';

import { MANTRA_QUERY_STALE_TIME_MS } from '../constants/mantra.constants';

export function useMantra(slug: string | undefined) {
  return useQuery({
    queryKey: mantraQueryKeys.detail(slug ?? ''),

    queryFn: () => getMantraBySlug(slug as string),

    enabled: Boolean(slug),

    staleTime: MANTRA_QUERY_STALE_TIME_MS,
  });
}
