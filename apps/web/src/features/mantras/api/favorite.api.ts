import { apiRequest } from '@/services/api/client';
import type {
  FavoriteMantrasResponse,
  FavoriteMutationResponse,
  Mantra,
} from '@devsangam/types';

export async function getFavoriteMantras(): Promise<Mantra[]> {
  const response = await apiRequest<FavoriteMantrasResponse>(
    '/users/me/favorites'
  );

  return response.data.mantras;
}

export async function addFavoriteMantra(
  slug: string
): Promise<FavoriteMutationResponse['data']> {
  const response = await apiRequest<FavoriteMutationResponse>(
    `/users/me/favorites/${encodeURIComponent(slug)}`,
    {
      method: 'PUT',
    }
  );

  return response.data;
}

export async function removeFavoriteMantra(
  slug: string
): Promise<FavoriteMutationResponse['data']> {
  const response = await apiRequest<FavoriteMutationResponse>(
    `/users/me/favorites/${encodeURIComponent(slug)}`,
    {
      method: 'DELETE',
    }
  );

  return response.data;
}
