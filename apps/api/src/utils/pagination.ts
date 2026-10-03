import { AppError } from './app-error.ts';
import { z } from 'zod';

export function pagination(query: Record<string, unknown>) {
  const result = z
    .object({
      page: z.coerce.number().int().min(1).max(100000).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .safeParse(query);
  if (!result.success)
    throw new AppError(400, 'INVALID_PAGINATION', 'Invalid page or limit.');
  return { ...result.data, skip: (result.data.page - 1) * result.data.limit };
}
