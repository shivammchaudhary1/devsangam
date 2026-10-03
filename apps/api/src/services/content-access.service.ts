import { EntitlementModel } from '../models/commerce.model.ts';
import { MantraModel } from '../models/mantra.model.ts';
import { AppError } from '../utils/app-error.ts';

export async function hasEntitlement(
  userId: string | undefined,
  resourceType: 'mantra' | 'digital_product',
  resourceId: unknown
) {
  if (!userId) return false;
  return Boolean(
    await EntitlementModel.exists({
      userId,
      resourceType,
      resourceId: String(resourceId),
      status: 'active',
    })
  );
}

export async function requireMantraAccess(userId: string, mantraId: unknown) {
  const mantra = await MantraModel.findById(mantraId).select('accessType');
  if (!mantra) throw new AppError(404, 'MANTRA_NOT_FOUND', 'Mantra not found.');
  if (
    mantra.accessType === 'paid' &&
    !(await hasEntitlement(userId, 'mantra', mantraId))
  ) {
    throw new AppError(
      403,
      'CONTENT_LOCKED',
      'Purchase this mantra to begin practice.'
    );
  }
}

export async function serializeMantra<
  T extends { _id: unknown; accessType?: string },
>(mantra: T, userId?: string) {
  const locked =
    mantra.accessType === 'paid' &&
    !(await hasEntitlement(userId, 'mantra', mantra._id));
  return {
    ...mantra,
    locked,
    ...(locked
      ? {
          sanskrit: '',
          transliteration: '',
          meaning: '',
          description: null,
          benefits: [],
        }
      : {}),
  };
}
