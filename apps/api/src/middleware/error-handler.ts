import type { ErrorRequestHandler } from 'express';

import { AppError } from '../utils/app-error.ts';

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

  console.error('Unhandled API error:', error);

  response.status(500).json({
    success: false,

    error: {
      code: 'INTERNAL_SERVER_ERROR',

      message: 'Something went wrong.',
    },
  });
};
