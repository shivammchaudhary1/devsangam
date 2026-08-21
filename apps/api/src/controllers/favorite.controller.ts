import { MantraModel } from '../models/mantra.model.ts';
import { UserModel } from '../models/user.model.ts';
import { AppError } from '../utils/app-error.ts';
import type { Request, Response } from 'express';

function getAuthenticatedUserId(request: Request) {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  return userId;
}

export async function getFavoriteMantras(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const user = await UserModel.findById(userId).select('favoriteMantraIds');

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  const mantras = await MantraModel.find({
    _id: {
      $in: user.favoriteMantraIds,
    },

    isPublished: true,
  })
    .select('-__v')
    .sort({
      title: 1,
    });

  response.status(200).json({
    success: true,

    data: {
      mantras,
    },
  });
}

export async function addFavoriteMantra(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const { slug } = request.params;

  const mantra = await MantraModel.findOne({
    slug,
    isPublished: true,
  }).select('_id slug');

  if (!mantra) {
    throw new AppError(404, 'MANTRA_NOT_FOUND', 'Mantra not found.');
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $addToSet: {
        favoriteMantraIds: mantra._id,
      },
    },
    {
      new: true,
    }
  ).select('favoriteMantraIds');

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  response.status(200).json({
    success: true,

    data: {
      mantraId: mantra._id.toString(),
      slug: mantra.slug,
      isFavorite: true,
    },
  });
}

export async function removeFavoriteMantra(
  request: Request,
  response: Response
) {
  const userId = getAuthenticatedUserId(request);

  const { slug } = request.params;

  const mantra = await MantraModel.findOne({
    slug,
  }).select('_id slug');

  if (!mantra) {
    throw new AppError(404, 'MANTRA_NOT_FOUND', 'Mantra not found.');
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: {
        favoriteMantraIds: mantra._id,
      },
    },
    {
      new: true,
    }
  ).select('favoriteMantraIds');

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  response.status(200).json({
    success: true,

    data: {
      mantraId: mantra._id.toString(),
      slug: mantra.slug,
      isFavorite: false,
    },
  });
}
