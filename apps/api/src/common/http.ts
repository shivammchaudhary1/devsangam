import { errorHandler } from '../middleware/error-handler.ts';
import { AppError } from '../utils/app-error.ts';
import {
  type ArgumentsHost,
  Body,
  Catch,
  type ExceptionFilter,
  HttpException,
  type PipeTransform,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ZodType } from 'zod';

class BodyValidationError extends Error {
  constructor(readonly fields: Record<string, string[] | undefined>) {
    super('Invalid request data.');
  }
}

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}
  transform(value: unknown) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) throw new BodyValidationError(parsed.error.flatten().fieldErrors);
    return parsed.data;
  }
}

export const ValidatedBody = (schema: ZodType) => Body(new ZodValidationPipe(schema));

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    if (response.headersSent) return;
    if (error instanceof BodyValidationError) {
      response.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          fields: error.fields,
        },
      });
      return;
    }
    if (error instanceof HttpException) {
      const status = error.getStatus();
      errorHandler(
        new AppError(
          status,
          status === 404 ? 'NOT_FOUND' : 'REQUEST_FAILED',
          status === 404 ? 'Resource not found.' : 'Request could not be processed.',
        ),
        http.getRequest<Request>(),
        response,
        () => undefined,
      );
      return;
    }
    errorHandler(error, http.getRequest<Request>(), response, () => undefined);
  }
}
