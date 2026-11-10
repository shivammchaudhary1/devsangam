import { getHealth } from './health.handlers.ts';
import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('health')
export class HealthController {
  @Get('')
  getHealth(@Req() req: Request, @Res() res: Response) {
    return getHealth(req, res);
  }
}
