import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_request, response) => {
  response.status(200).json({
    success: true,
    data: {
      service: 'devsangam-api',
      status: 'healthy',
    },
  });
});
