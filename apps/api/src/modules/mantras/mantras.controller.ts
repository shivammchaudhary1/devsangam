import { OptionalSessionGuard } from '../../common/guards.ts';
import { getMantraBySlug, listMantras } from '../../controllers/mantra.controller.ts';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('mantras')
@UseGuards(OptionalSessionGuard)
export class MantrasController {
  @Get('')
  listMantras(@Req() req: Request, @Res() res: Response) {
    return listMantras(req, res);
  }
  @Get(':slug')
  getMantraBySlug(@Req() req: Request, @Res() res: Response) {
    return getMantraBySlug(req, res);
  }
}
