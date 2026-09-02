import { AppError } from '../utils/app-error.ts';
import type { RequestHandler } from 'express';
import multer from 'multer';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const multerAvatarUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,

    files: 1,
  },

  fileFilter(_request, file, callback) {
    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
      callback(
        new AppError(
          400,
          'AVATAR_TYPE_INVALID',
          'Profile photo must be a JPEG, PNG, or WebP image.'
        )
      );

      return;
    }

    callback(null, true);
  },
}).single('avatar');

export const uploadAvatarFile: RequestHandler = (request, response, next) => {
  multerAvatarUpload(request, response, (error) => {
    if (!error) {
      next();

      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(
          new AppError(
            400,
            'AVATAR_TOO_LARGE',
            'Profile photo cannot exceed 5 MB.'
          )
        );

        return;
      }

      if (error.code === 'LIMIT_FILE_COUNT') {
        next(
          new AppError(
            400,
            'AVATAR_FILE_COUNT_INVALID',
            'Only one profile photo can be uploaded at a time.'
          )
        );

        return;
      }

      next(
        new AppError(
          400,
          'AVATAR_UPLOAD_INVALID',
          'Profile photo upload is invalid.'
        )
      );

      return;
    }

    if (error instanceof AppError) {
      next(error);

      return;
    }

    next(
      new AppError(
        400,
        'AVATAR_UPLOAD_INVALID',
        'Profile photo upload could not be processed.'
      )
    );
  });
};
