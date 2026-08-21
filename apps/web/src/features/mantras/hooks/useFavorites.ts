import { getFavoriteMantras } from '../api/favorite.api';
import { favoriteQueryKeys } from '../api/favorite.query-keys';
import { MANTRA_QUERY_STALE_TIME_MS } from '../constants/mantra.constants';
import { useQuery } from '@tanstack/react-query';

export function useFavorites() {
  return useQuery({
    queryKey: favoriteQueryKeys.list(),

    queryFn: getFavoriteMantras,

    staleTime: MANTRA_QUERY_STALE_TIME_MS,
  });
}
