import { PaymentRateLimitGuard,SessionGuard } from '../../common/guards.ts';
import { ValidatedBody } from '../../common/http.ts';
import { createOrderSchema, verifyPaymentSchema } from '../../validators/commerce.schema.ts';
import { createPaymentOrder, reconcilePaymentOrder,verifyPaymentCheckout } from './payments.handlers.ts';
import { Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('payments')
@UseGuards(SessionGuard, PaymentRateLimitGuard)
export class PaymentsController {
  @Post('orders')
  @HttpCode(200)
  createPaymentOrder(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(createOrderSchema) body: unknown,
  ) {
    req.body = body;
    return createPaymentOrder(req, res);
  }
  @Post('verify')
  @HttpCode(200)
  verifyPaymentCheckout(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(verifyPaymentSchema) body: unknown,
  ) {
    req.body = body;
    return verifyPaymentCheckout(req, res);
  }
  @Post('orders/:id/reconcile')
  @HttpCode(200)
  reconcilePaymentOrder(@Req() req: Request, @Res() res: Response) {
    return reconcilePaymentOrder(req, res);
  }
}
