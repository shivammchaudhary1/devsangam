import {
  getInsightsOverview,
  getPracticeHistory,
} from '../controllers/insights.controller.ts';
import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { Router } from 'express';

export const insightsRouter = Router();

insightsRouter.use(requireAuth, requireActiveSession);
insightsRouter.get('/overview', getInsightsOverview);
insightsRouter.get('/history', getPracticeHistory);
