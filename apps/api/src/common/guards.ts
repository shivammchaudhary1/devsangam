import { optionalActiveSession, optionalAuth } from '../middleware/optional-session.ts';
import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAdmin } from '../middleware/require-admin.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, RequestHandler, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

// Reuse the existing session/token policies; Nest owns route authorization.
export function runMiddleware(req: Request, res: Response, handler: RequestHandler): Promise<void> {
  return new Promise((resolve, reject) => {
    const finished = () => resolve();
    res.once('finish', finished);
    Promise.resolve(
      handler(req, res, (error?: unknown) => {
        res.removeListener('finish', finished);
        if (error) reject(error);
        else resolve();
      }),
    ).catch((error: unknown) => {
      res.removeListener('finish', finished);
      reject(error);
    });
  });
}

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    await runMiddleware(http.getRequest(), http.getResponse(), requireAuth);
    await runMiddleware(http.getRequest(), http.getResponse(), requireActiveSession);
    return true;
  }
}

@Injectable()
export class AdminGuard extends SessionGuard {
  override async canActivate(context: ExecutionContext) {
    await super.canActivate(context);
    await runMiddleware(
      context.switchToHttp().getRequest(),
      context.switchToHttp().getResponse(),
      requireAdmin,
    );
    return true;
  }
}

@Injectable()
export class OptionalSessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    await runMiddleware(http.getRequest(), http.getResponse(), optionalAuth);
    await runMiddleware(http.getRequest(), http.getResponse(), optionalActiveSession);
    return true;
  }
}

@Injectable()
export class AdminRateLimitGuard implements CanActivate {
  private readonly limiter = rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false });
  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    await runMiddleware(http.getRequest(), http.getResponse(), this.limiter);
    return !http.getResponse<Response>().headersSent;
  }
}
@Injectable()
export class PaymentRateLimitGuard implements CanActivate {
  private readonly limiter = rateLimit({ windowMs: 60000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    await runMiddleware(http.getRequest(), http.getResponse(), this.limiter);
    return !http.getResponse<Response>().headersSent;
  }
}
