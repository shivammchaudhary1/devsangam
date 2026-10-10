import { handlePaymentWebhook } from './payments.handlers.ts';
import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
@Controller('payments/webhook')
export class WebhookController {
  @Post()
  @HttpCode(200)
  handle(@Req() req: Request, @Res() res: Response) {
    return handlePaymentWebhook(req, res);
  }
}
