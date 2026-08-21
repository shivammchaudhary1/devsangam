import { addFavoriteMantra, removeFavoriteMantra } from '../api/favorite.api';
import { favoriteQueryKeys } from '../api/favorite.query-keys';
import type { Mantra } from '@devsangam/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ToggleFavoriteInput = {
  mantra: Mantra;
  isFavorite: boolean;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mantra, isFavorite }: ToggleFavoriteInput) => {
      if (isFavorite) {
        return removeFavoriteMantra(mantra.slug);
      }

      return addFavoriteMantra(mantra.slug);
    },

    onMutate: async ({ mantra, isFavorite }) => {
      await queryClient.cancelQueries({
        queryKey: favoriteQueryKeys.list(),
      });

      const previousFavorites = queryClient.getQueryData<Mantra[]>(
        favoriteQueryKeys.list()
      );

      queryClient.setQueryData<Mantra[]>(
        favoriteQueryKeys.list(),
        (current = []) => {
          if (isFavorite) {
            return current.filter((item) => item._id !== mantra._id);
          }

          const alreadyExists = current.some((item) => item._id === mantra._id);

          if (alreadyExists) {
            return current;
          }

          return [...current, mantra];
        }
      );

      return {
        previousFavorites,
      };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(
          favoriteQueryKeys.list(),
          context.previousFavorites
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: favoriteQueryKeys.list(),
      });
    },
  });
}
