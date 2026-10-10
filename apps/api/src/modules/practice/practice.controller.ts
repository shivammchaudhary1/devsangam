import { SessionGuard } from '../../common/guards.ts';
import {
  completePracticeSession,
  createPracticeSession,
  getPracticeSession,
  getPracticeSessions,
  updatePracticeSession,
} from '../../controllers/practice-session.controller.ts';
import { Controller, Get, HttpCode, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('practice')
@UseGuards(SessionGuard)
export class PracticeController {
  @Get('sessions')
  getPracticeSessions(@Req() req: Request, @Res() res: Response) {
    return getPracticeSessions(req, res);
  }
  @Get('sessions/:sessionId')
  getPracticeSession(@Req() req: Request, @Res() res: Response) {
    return getPracticeSession(req, res);
  }
  @Post('sessions')
  @HttpCode(200)
  createPracticeSession(@Req() req: Request, @Res() res: Response) {
    return createPracticeSession(req, res);
  }
  @Patch('sessions/:sessionId')
  updatePracticeSession(@Req() req: Request, @Res() res: Response) {
    return updatePracticeSession(req, res);
  }
  @Post('sessions/:sessionId/complete')
  @HttpCode(200)
  completePracticeSession(@Req() req: Request, @Res() res: Response) {
    return completePracticeSession(req, res);
  }
}
