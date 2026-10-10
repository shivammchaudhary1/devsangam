import { SessionGuard } from '../../common/guards.ts';
import { ValidatedBody } from '../../common/http.ts';
import {
  getPushPublicKey,
  sendTestPush,
  subscribeToPush,
  unsubscribeFromPush,
} from '../../controllers/push.controller.ts';
import { subscribePushSchema } from '../../validators/push/subscribe-push.schema.ts';
import { unsubscribePushSchema } from '../../validators/push/unsubscribe-push.schema.ts';
import { Controller, Delete, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('push')
@UseGuards(SessionGuard)
export class PushController {
  @Get('public-key')
  getPushPublicKey(@Req() req: Request, @Res() res: Response) {
    return getPushPublicKey(req, res);
  }
  @Post('subscriptions')
  @HttpCode(200)
  subscribeToPush(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(subscribePushSchema) body: unknown,
  ) {
    req.body = body;
    return subscribeToPush(req, res);
  }
  @Delete('subscriptions')
  unsubscribeFromPush(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(unsubscribePushSchema) body: unknown,
  ) {
    req.body = body;
    return unsubscribeFromPush(req, res);
  }
  @Post('test')
  @HttpCode(200)
  sendTestPush(@Req() req: Request, @Res() res: Response) {
    return sendTestPush(req, res);
  }
}
