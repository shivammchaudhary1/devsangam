import {
  getMantraBySlug,
  listMantras,
} from '../controllers/mantra.controller.ts';
import { Router } from 'express';

export const mantraRouter = Router();

mantraRouter.get('/', listMantras);

mantraRouter.get('/:slug', getMantraBySlug);
