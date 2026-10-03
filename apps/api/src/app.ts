import { API_BASE_PATH } from './constants/routes.constants.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { apiRateLimiter } from './middleware/rate-limiters.ts';
import { verifyOrigin } from './middleware/verify-origin.ts';
import { allRoutes } from './routes/allRoutes.ts';
import { contactRouter } from './routes/contact.routes.ts';
import { webhookRouter } from './routes/payment.routes.ts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

export const app = express();

app.disable('x-powered-by');
if (/^[0-3]$/.test(process.env.TRUST_PROXY_HOPS ?? ''))
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));

app.use(helmet());

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['X-DevSangam-Public'],
  })
);

app.use(API_BASE_PATH, apiRateLimiter);

app.use(cookieParser());
app.use(verifyOrigin);

// Parse the public contact body before the broader V1 JSON parser.
app.use(`${API_BASE_PATH}/contact`, contactRouter);
app.use(`${API_BASE_PATH}/payments/webhook`, webhookRouter);

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(API_BASE_PATH, allRoutes);

app.use(errorHandler);
