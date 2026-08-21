import { Router } from 'express';

import {
  getMantraBySlug,
  listMantras,
} from '../controllers/mantra.controller.ts';

export const mantraRouter = Router();

mantraRouter.get('/', listMantras);

mantraRouter.get('/:slug', getMantraBySlug);
