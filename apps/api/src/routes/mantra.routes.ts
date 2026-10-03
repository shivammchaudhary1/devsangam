import {
  getMantraBySlug,
  listMantras,
} from '../controllers/mantra.controller.ts';
import {
  optionalActiveSession,
  optionalAuth,
} from '../middleware/optional-session.ts';
import { Router } from 'express';

export const mantraRouter = Router();
mantraRouter.use(optionalAuth, optionalActiveSession);

mantraRouter.get('/', listMantras);

mantraRouter.get('/:slug', getMantraBySlug);
