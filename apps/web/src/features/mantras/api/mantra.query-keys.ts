import type { GetMantrasParams } from './mantra.api';

export const mantraQueryKeys = {
  all: ['mantras'] as const,

  lists: () => [...mantraQueryKeys.all, 'list'] as const,

  list: (params: GetMantrasParams) =>
    [...mantraQueryKeys.lists(), params] as const,

  details: () => [...mantraQueryKeys.all, 'detail'] as const,

  detail: (slug: string) => [...mantraQueryKeys.details(), slug] as const,
};
