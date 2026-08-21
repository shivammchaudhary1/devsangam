import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { userRouter } from './routes/user.routes.ts';
import { mantraRouter } from './routes/mantra.routes.ts';

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

app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,

    data: {
      service: 'devsangam-api',
      status: 'healthy',
    },
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/mantras', mantraRouter);

app.use(errorHandler);
