import { API_ROUTE_PATHS } from '../constants/routes.constants.ts';
import { adminRouter } from './admin.routes.ts';
import { authRouter } from './auth.routes.ts';
import { healthRouter } from './health.routes.ts';
import { insightsRouter } from './insights.routes.ts';
import { mantraRouter } from './mantra.routes.ts';
import { paymentRouter } from './payment.routes.ts';
import { practiceSessionRouter } from './practice-session.routes.ts';
import { pushRouter } from './push.routes.ts';
import { libraryRouter, storeRouter } from './store.routes.ts';
import { userRouter } from './user.routes.ts';
import { Router } from 'express';

export const allRoutes = Router();
allRoutes.use('/admin', adminRouter);
allRoutes.use('/store', storeRouter);
allRoutes.use('/library', libraryRouter);
allRoutes.use('/payments', paymentRouter);

allRoutes.use(API_ROUTE_PATHS.health, healthRouter);

allRoutes.use(API_ROUTE_PATHS.auth, authRouter);

allRoutes.use(API_ROUTE_PATHS.users, userRouter);

allRoutes.use(API_ROUTE_PATHS.mantras, mantraRouter);

allRoutes.use(API_ROUTE_PATHS.practice, practiceSessionRouter);

allRoutes.use(API_ROUTE_PATHS.insights, insightsRouter);

allRoutes.use(API_ROUTE_PATHS.push, pushRouter);
