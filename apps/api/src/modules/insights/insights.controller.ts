import { SessionGuard } from '../../common/guards.ts';
import { getInsightsOverview, getPracticeHistory } from '../../controllers/insights.controller.ts';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('insights')
@UseGuards(SessionGuard)
export class InsightsController {
  @Get('overview')
  getInsightsOverview(@Req() req: Request, @Res() res: Response) {
    return getInsightsOverview(req, res);
  }
  @Get('history')
  getPracticeHistory(@Req() req: Request, @Res() res: Response) {
    return getPracticeHistory(req, res);
  }
}
