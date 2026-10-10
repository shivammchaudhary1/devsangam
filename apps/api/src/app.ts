import 'reflect-metadata';
import { ApiExceptionFilter } from './common/http.ts';
import { API_BASE_PATH } from './constants/routes.constants.ts';
import {
  apiRateLimiter,
  forgotPasswordRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  resetPasswordRateLimiter,
} from './middleware/rate-limiters.ts';
import { verifyOrigin } from './middleware/verify-origin.ts';
import { ApiModule } from './modules/api.module.ts';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

export async function createApiApplication() {
  const application = await NestFactory.create<NestExpressApplication>(ApiModule, {
    logger: false,
    bodyParser: false,
  });
  const http = application.getHttpAdapter().getInstance();
  http.disable('x-powered-by');
  if (/^[0-3]$/.test(process.env.TRUST_PROXY_HOPS ?? ''))
    http.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
  application.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['X-DevSangam-Public'],
  });
  application.use(helmet());
  application.use(API_BASE_PATH, apiRateLimiter);
  application.use(cookieParser(), verifyOrigin);
  application.use(
    API_BASE_PATH + '/contact',
    rateLimit({
      windowMs: 3600000,
      limit: 5,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Please try again later.',
        },
      },
    }),
    express.json({ limit: '8kb' }),
  );
  application.use(
    API_BASE_PATH + '/payments/webhook',
    express.raw({ type: 'application/json', limit: '64kb' }),
  );
  application.use(express.json({ limit: '1mb' }));
  for (const [route, limiter] of [
    ['register', registerRateLimiter],
    ['login', loginRateLimiter],
    ['forgot-password', forgotPasswordRateLimiter],
    ['reset-password', resetPasswordRateLimiter],
  ] as const)
    application.use(API_BASE_PATH + '/auth/' + route, limiter);
  application.setGlobalPrefix(API_BASE_PATH.slice(1));
  application.useGlobalFilters(new ApiExceptionFilter());
  application.enableShutdownHooks();
  await application.init();
  return application;
}
