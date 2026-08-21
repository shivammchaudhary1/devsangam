import { useQuery } from '@tanstack/react-query';

import { getMantras, type GetMantrasParams } from '../api/mantra.api';

import { mantraQueryKeys } from '../api/mantra.query-keys';

export function useMantras(params: GetMantrasParams = {}) {
  return useQuery({
    queryKey: mantraQueryKeys.list(params),

    queryFn: () => getMantras(params),

    staleTime: 5 * 60 * 1000,
  });
}
