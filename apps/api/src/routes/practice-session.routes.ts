import {
  completePracticeSession,
  createPracticeSession,
  getPracticeSession,
  getPracticeSessions,
  updatePracticeSession,
} from '../controllers/practice-session.controller.ts';
import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { Router } from 'express';

export const practiceSessionRouter = Router();

practiceSessionRouter.use(requireAuth, requireActiveSession);

practiceSessionRouter.get('/sessions', getPracticeSessions);

practiceSessionRouter.get('/sessions/:sessionId', getPracticeSession);

practiceSessionRouter.post('/sessions', createPracticeSession);

practiceSessionRouter.patch('/sessions/:sessionId', updatePracticeSession);

practiceSessionRouter.post(
  '/sessions/:sessionId/complete',
  completePracticeSession
);
