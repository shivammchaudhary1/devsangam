import { useQuery } from '@tanstack/react-query';

import { getMantraBySlug } from '../api/mantra.api';
import { mantraQueryKeys } from '../api/mantra.query-keys';

export function useMantra(slug: string | undefined) {
  return useQuery({
    queryKey: mantraQueryKeys.detail(slug ?? ''),

    queryFn: () => getMantraBySlug(slug!),

    enabled: Boolean(slug),

    staleTime: 5 * 60 * 1000,
  });
}
