import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { validateBody } from '../middleware/validate-body.ts';
import { OrderModel } from '../models/commerce.model.ts';
import {
  createOrder,
  reconcileOrder,
  reconcilePayment,
  verifyCheckout,
  verifySignature,
} from '../services/payment.service.ts';
import { AppError } from '../utils/app-error.ts';
import {
  createOrderSchema,
  idSchema,
  verifyPaymentSchema,
} from '../validators/commerce.schema.ts';
import express, { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createHash } from 'node:crypto';
import { z } from 'zod';

export const paymentRouter = Router();
paymentRouter.use(
  requireAuth,
  requireActiveSession,
  rateLimit({
    windowMs: 60000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
);
paymentRouter.post(
  '/orders',
  validateBody(createOrderSchema),
  async (req, res) => {
    res.status(201).json({
      success: true,
      data: await createOrder(
        req.auth!.userId,
        req.body.itemType,
        req.body.itemId
      ),
    });
  }
);
paymentRouter.post(
  '/verify',
  validateBody(verifyPaymentSchema),
  async (req, res) => {
    const status = await verifyCheckout(req.auth!.userId, req.body);
    res
      .status(status === 'paid' ? 200 : 202)
      .json({ success: true, data: { status } });
  }
);
paymentRouter.post('/orders/:id/reconcile', async (req, res) => {
  const parsed = idSchema.safeParse(req.params.id);
  if (
    !parsed.success ||
    !(await OrderModel.exists({ _id: parsed.data, userId: req.auth!.userId }))
  ) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  }
  res.json({
    success: true,
    data: { status: await reconcileOrder(parsed.data) },
  });
});
export const webhookRouter = Router();
webhookRouter.post(
  '/',
  express.raw({ type: 'application/json', limit: '64kb' }),
  async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.get('x-razorpay-signature') ?? '';
    if (
      !secret ||
      process.env.PAYMENTS_ENABLED !== 'true' ||
      !Buffer.isBuffer(req.body) ||
      !verifySignature(req.body, signature, secret)
    ) {
      throw new AppError(
        400,
        'INVALID_WEBHOOK',
        'Webhook verification failed.'
      );
    }
    let body: unknown;
    try {
      body = JSON.parse(req.body.toString());
    } catch {
      throw new AppError(400, 'INVALID_WEBHOOK', 'Invalid webhook.');
    }
    const parsed = z
      .object({
        event: z.string(),
        payload: z.object({
          payment: z
            .object({
              entity: z.object({
                id: z.string().regex(/^pay_[a-zA-Z0-9]+$/),
                order_id: z.string(),
              }),
            })
            .optional(),
          refund: z
            .object({
              entity: z.object({
                payment_id: z.string().regex(/^pay_[a-zA-Z0-9]+$/),
              }),
            })
            .optional(),
        }),
      })
      .safeParse(body);
    if (!parsed.success)
      throw new AppError(400, 'INVALID_WEBHOOK', 'Invalid webhook.');
    if (
      [
        'payment.captured',
        'payment.failed',
        'payment.refunded',
        'order.paid',
        'refund.processed',
      ].includes(parsed.data.event)
    ) {
      const paymentId =
        parsed.data.payload.payment?.entity.id ??
        parsed.data.payload.refund?.entity.payment_id;
      if (!paymentId)
        throw new AppError(400, 'INVALID_WEBHOOK', 'Invalid webhook.');
      // Map refunds using the provider payment, not a client order identifier.
      let order = parsed.data.payload.payment?.entity.order_id
        ? await OrderModel.findOne({
            razorpayOrderId: parsed.data.payload.payment.entity.order_id,
          })
        : await OrderModel.findOne({ razorpayPaymentId: paymentId });
      if (!order) {
        const { razorpayRequest } = await import('../config/razorpay.ts');
        const payment = z
          .object({ order_id: z.string() })
          .parse(
            await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`)
          );
        order = await OrderModel.findOne({ razorpayOrderId: payment.order_id });
      }
      if (!order)
        throw new AppError(
          503,
          'ORDER_NOT_READY',
          'Please retry this event later.'
        );
      await reconcilePayment(order.id, paymentId, {
        id:
          req.get('x-razorpay-event-id')?.slice(0, 200) ||
          createHash('sha256').update(req.body).digest('hex'),
        type: parsed.data.event,
      });
    }
    res.json({ success: true });
  }
);
