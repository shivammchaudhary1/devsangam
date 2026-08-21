import { apiRequest } from '@/services/api/client';
import type {
  Mantra,
  MantraDetailResponse,
  MantraListResponse,
} from '@devsangam/types';

export type GetMantrasParams = {
  search?: string;
  category?: string;
};

export async function getMantras(
  params: GetMantrasParams = {}
): Promise<Mantra[]> {
  const searchParams = new URLSearchParams();

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  if (params.category?.trim()) {
    searchParams.set('category', params.category.trim());
  }

  const query = searchParams.toString();

  const response = await apiRequest<MantraListResponse>(
    `/mantras${query ? `?${query}` : ''}`,
    {
      skipAuthRefresh: true,
    }
  );

  return response.data.mantras;
}

export async function getMantraBySlug(slug: string): Promise<Mantra> {
  const response = await apiRequest<MantraDetailResponse>(
    `/mantras/${encodeURIComponent(slug)}`,
    {
      skipAuthRefresh: true,
    }
  );

  return response.data.mantra;
}
