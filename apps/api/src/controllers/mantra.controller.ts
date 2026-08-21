import { MantraModel } from '../models/mantra.model.ts';
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

  response.status(200).json({
    success: true,

    data: {
      mantras,
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

  response.status(200).json({
    success: true,

    data: {
      mantra,
    },
  });
}
