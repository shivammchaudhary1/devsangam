import { runMiddleware } from './guards.ts';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { RequestHandler } from 'express';

// Keep the established Multer validation/error contract inside Nest's lifecycle.
@Injectable()
export class UploadInterceptor implements NestInterceptor {
  constructor(private readonly upload: RequestHandler) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    await runMiddleware(http.getRequest(), http.getResponse(), this.upload);
    return next.handle();
  }
}
