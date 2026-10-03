import { AppError } from '../utils/app-error.ts';
import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';

function isDuplicateKeyError(error: unknown): error is {
  code: number;
  keyPattern?: Record<string, number>;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (
      error as {
        code?: unknown;
      }
    ).code === 11000
  );
}

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  void _next;
  if (error instanceof MulterError) {
    response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      success: false,
      error: {
        code: 'INVALID_UPLOAD',
        message: 'Upload is invalid or exceeds the allowed size.',
      },
    });
    return;
  }

  if (
    error?.type === 'entity.too.large' ||
    error?.type === 'entity.parse.failed'
  ) {
    response.status(error.type === 'entity.too.large' ? 413 : 400).json({
      success: false,
      error: {
        code: 'INVALID_BODY',
        message: 'Request body is invalid or too large.',
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,

      error: {
        code: error.code,

        message: error.message,

        details: error.details,
      },
    });

    return;
  }

  if (isDuplicateKeyError(error)) {
    response.status(409).json({
      success: false,

      error: {
        code: 'RESOURCE_CONFLICT',

        message: 'A resource with that value already exists.',
      },
    });

    return;
  }

  // Error payloads/stacks from providers and parsers may contain private values.
  console.error(
    'Unhandled API error:',
    error instanceof Error ? error.name : 'UnknownError'
  );

  response.status(500).json({
    success: false,

    error: {
      code: 'INTERNAL_SERVER_ERROR',

      message: 'Something went wrong.',
    },
  });
};
