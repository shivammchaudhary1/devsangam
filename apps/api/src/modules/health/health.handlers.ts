import type { Request, Response } from 'express';
type HttpHandler = (req: Request, res: Response) => unknown;

export const getHealth: HttpHandler = (_request, response) => {
  response.status(200).json({
    success: true,
    data: {
      service: 'devsangam-api',
      status: 'healthy',
    },
  });
};
