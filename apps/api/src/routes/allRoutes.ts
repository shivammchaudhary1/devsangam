import { API_ROUTE_PATHS } from '../constants/routes.constants.ts';
import { authRouter } from './auth.routes.ts';
import { healthRouter } from './health.routes.ts';
import { mantraRouter } from './mantra.routes.ts';
import { practiceSessionRouter } from './practice-session.routes.ts';
import { userRouter } from './user.routes.ts';
import { Router } from 'express';

export const allRoutes = Router();

allRoutes.use(API_ROUTE_PATHS.health, healthRouter);
allRoutes.use(API_ROUTE_PATHS.auth, authRouter);
allRoutes.use(API_ROUTE_PATHS.users, userRouter);
allRoutes.use(API_ROUTE_PATHS.mantras, mantraRouter);
allRoutes.use(API_ROUTE_PATHS.practice, practiceSessionRouter);
