import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export function validateBody(schema: ZodType): RequestHandler {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        success: false,

        error: {
          code: 'VALIDATION_ERROR',

          message: 'Invalid request data.',

          fields: result.error.flatten().fieldErrors,
        },
      });

      return;
    }

    request.body = result.data;

    next();
  };
}
