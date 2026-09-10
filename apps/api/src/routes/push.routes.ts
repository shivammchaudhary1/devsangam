import {
  getPushPublicKey,
  sendTestPush,
  subscribeToPush,
  unsubscribeFromPush,
} from '../controllers/push.controller.ts';
import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { validateBody } from '../middleware/validate-body.ts';
import { subscribePushSchema } from '../validators/push/subscribe-push.schema.ts';
import { unsubscribePushSchema } from '../validators/push/unsubscribe-push.schema.ts';
import { Router } from 'express';

export const pushRouter = Router();

pushRouter.use(requireAuth, requireActiveSession);

pushRouter.get('/public-key', getPushPublicKey);

pushRouter.post(
  '/subscriptions',

  validateBody(subscribePushSchema),

  subscribeToPush
);

pushRouter.delete(
  '/subscriptions',

  validateBody(unsubscribePushSchema),

  unsubscribeFromPush
);

pushRouter.post('/test', sendTestPush);
