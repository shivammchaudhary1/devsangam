import { UserModel } from '../models/user.model.ts';
import { AppError } from '../utils/app-error.ts';
import type { RequestHandler } from 'express';

export const requireAdmin: RequestHandler = async (req, _res, next) => {
  if (
    !req.auth ||
    !(await UserModel.exists({ _id: req.auth.userId, role: 'admin' }))
  ) {
    throw new AppError(
      403,
      'ADMIN_REQUIRED',
      'Administrator access is required.'
    );
  }
  next();
};
