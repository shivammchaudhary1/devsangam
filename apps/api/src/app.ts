import cors from 'cors';
import express from 'express';

export const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
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
