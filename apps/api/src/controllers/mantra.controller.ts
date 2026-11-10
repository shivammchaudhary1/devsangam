import { MantraModel } from '../models/mantra.model.ts';
import { serializeMantra } from '../services/content-access.service.ts';
import { AppError } from '../utils/app-error.ts';
import type { Request, Response } from 'express';

export async function listMantras(request: Request, response: Response) {
  const search =
    typeof request.query.search === 'string' ? request.query.search.trim() : '';

  const category =
    typeof request.query.category === 'string'
      ? request.query.category.trim()
      : '';

  const filter: Record<string, unknown> = {
    isPublished: true,
  };

  if (category) {
    filter.categories = category;
  }

  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  const mantras = await MantraModel.find(filter)
    .select('-__v')
    .sort({
      title: 1,
    })
    .lean();

  const visible = await Promise.all(
    mantras.map((mantra) => serializeMantra(mantra, request.auth?.userId))
  );
  const cacheable = !visible.some(
    (mantra) => mantra.accessType === 'paid' && !mantra.locked
  );
  response.set('Cache-Control', cacheable ? 'public, max-age=60' : 'no-store');
  response.set('X-DevSangam-Public', cacheable ? 'true' : 'false');
  response.status(200).json({
    success: true,

    data: {
      mantras: visible,
    },
  });
}

export async function getMantraBySlug(request: Request, response: Response) {
  const slug = request.params.slug;

  const mantra = await MantraModel.findOne({
    slug,
    isPublished: true,
  })
    .select('-__v')
    .lean();

  if (!mantra) {
    throw new AppError(
      404,
      'MANTRA_NOT_FOUND',
      'The requested mantra could not be found.'
    );
  }

  response.set(
    'Cache-Control',
    mantra.accessType === 'paid' ? 'no-store' : 'public, max-age=60'
  );
  response.set(
    'X-DevSangam-Public',
    mantra.accessType === 'paid' ? 'false' : 'true'
  );
  response.status(200).json({
    success: true,

    data: {
      mantra: await serializeMantra(mantra, request.auth?.userId),
    },
  });
}
