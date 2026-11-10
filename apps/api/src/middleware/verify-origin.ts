import { API_BASE_PATH } from '../constants/routes.constants.ts';
import { AppError } from '../utils/app-error.ts';
import type { RequestHandler } from 'express';

export const verifyOrigin: RequestHandler = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // Razorpay supplies an authenticated signature rather than browser cookies/origin.
  if (req.path === `${API_BASE_PATH}/payments/webhook` && req.method === 'POST')
    return next();
  const expected = process.env.WEB_ORIGIN || 'http://localhost:5173';
  const origin = req.get('origin');
  const cookieAuthentication = Boolean(
    req.cookies?.ds_access || req.cookies?.ds_refresh
  );
  if ((origin && origin !== expected) || (!origin && cookieAuthentication)) {
    return next(
      new AppError(403, 'ORIGIN_DENIED', 'Request origin is not permitted.')
    );
  }
  return next();
};
