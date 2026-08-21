import { API_BASE_PATH } from './constants/routes.constants.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { allRoutes } from './routes/allRoutes.ts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

export const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(API_BASE_PATH, allRoutes);

app.use(errorHandler);
