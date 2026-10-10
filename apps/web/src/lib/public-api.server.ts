import 'server-only';
import type { ApiResult, DigitalProduct } from '@devsangam/types';
import { cache } from 'react';

const base =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:4000/api/v1';
export type PublicProductResult = ApiResult<{
  product: DigitalProduct;
  owned: boolean;
  paymentsEnabled: boolean;
}>;
export type PublicStoreResult = ApiResult<{ products: DigitalProduct[]; total: number }>;

// Only anonymous allowlisted requests. Never forward cookies/tokens into public SSR.
export const publicApi = cache(
  async <T>(endpoint: string): Promise<{ data?: T; status: number }> => {
    if (!/^\/store(?:\?[^#]*|\/[a-z0-9-]+)?$/.test(endpoint)) return { status: 400 };
    try {
      const response = await fetch(base.replace(/\/$/, '') + endpoint, {
        cache: 'no-store',
        credentials: 'omit',
        signal: AbortSignal.timeout(3000),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return { status: response.status };
      return { status: 200, data: (await response.json()) as T };
    } catch {
      return { status: 503 };
    }
  },
);
