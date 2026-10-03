import { requireActiveSession } from './require-active-session.ts';
import { requireAuth } from './require-auth.ts';
import type { RequestHandler } from 'express';

export const optionalAuth: RequestHandler = (req, res, next) => {
  if (!req.cookies?.ds_access) return next();
  return requireAuth(req, res, next);
};
export const optionalActiveSession: RequestHandler = (req, res, next) => {
  if (!req.auth) return next();
  return requireActiveSession(req, res, next);
};
