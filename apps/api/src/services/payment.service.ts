import { paymentConfig, razorpayRequest } from '../config/razorpay.ts';
import {
  DigitalProductModel,
  EntitlementModel,
  OrderModel,
  PaymentEventModel,
} from '../models/commerce.model.ts';
import { MantraModel } from '../models/mantra.model.ts';
import { AppError } from '../utils/app-error.ts';
import { hasEntitlement } from './content-access.service.ts';
import { assertPrivatePdfAvailable } from './private-asset.service.ts';
import mongoose from 'mongoose';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export function verifySignature(
  message: string | Buffer,
  signature: string,
  secret: string
) {
  if (!/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(message).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
const paymentSchema = z.object({
  id: z.string().regex(/^pay_[a-zA-Z0-9]+$/),
  order_id: z.string(),
  amount: z.number().int().positive(),
  currency: z.literal('INR'),
  status: z.string(),
  amount_refunded: z.number().int().nonnegative().default(0),
});
export async function createOrder(
  userId: string,
  itemType: 'mantra' | 'digital_product',
  itemId: string
) {
  const { keyId } = paymentConfig();
  const item =
    itemType === 'mantra'
      ? await MantraModel.findOne({ _id: itemId, isPublished: true })
      : await DigitalProductModel.findOne({
          _id: itemId,
          published: true,
        }).select('+fileStorageKey');
  if (
    !item ||
    item.accessType !== 'paid' ||
    !item.pricePaise ||
    !Number.isInteger(item.pricePaise) ||
    item.pricePaise < 1 ||
    (itemType === 'digital_product' && !item.get('fileStorageKey'))
  ) {
    throw new AppError(
      400,
      'ITEM_UNAVAILABLE',
      'This item is not available for purchase.'
    );
  }
  if (await hasEntitlement(userId, itemType, itemId))
    throw new AppError(409, 'ALREADY_OWNED', 'You already have access.');
  if (itemType === 'digital_product')
    await assertPrivatePdfAvailable(item.get('fileStorageKey'));
  const order = await OrderModel.create({
    userId,
    itemType,
    itemId,
    title: item.title,
    amountPaise: item.pricePaise,
    currency: 'INR',
  });
  try {
    const external = z
      .object({
        id: z.string().regex(/^order_[a-zA-Z0-9]+$/),
        amount: z.number(),
        currency: z.literal('INR'),
      })
      .parse(
        await razorpayRequest('/orders', {
          amount: order.amountPaise,
          currency: 'INR',
          receipt: order.id,
        })
      );
    if (external.amount !== order.amountPaise) throw new Error('Wrong amount');
    order.razorpayOrderId = external.id;
    order.status = 'payment_pending';
    await order.save();
    return {
      orderId: order.id,
      razorpayOrderId: external.id,
      amountPaise: order.amountPaise,
      currency: 'INR',
      keyId,
      title: item.title,
    };
  } catch {
    await OrderModel.updateOne(
      { _id: order._id, status: 'created' },
      { status: 'failed' }
    );
    throw new AppError(
      503,
      'PAYMENT_PROVIDER_UNAVAILABLE',
      'Could not start payment. Please try again later.'
    );
  }
}

export async function reconcilePayment(
  orderId: string,
  paymentId: string,
  event?: { id: string; type: string }
) {
  const paymentResult = paymentSchema.safeParse(
    await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`)
  );
  if (!paymentResult.success)
    throw new AppError(
      502,
      'INVALID_PAYMENT',
      'Payment could not be confirmed.'
    );
  const payment = paymentResult.data;
  try {
    return await mongoose.connection.transaction(async (session) => {
      const order = await OrderModel.findById(orderId).session(session);
      if (
        !order ||
        payment.id !== paymentId ||
        payment.order_id !== order.razorpayOrderId ||
        payment.amount !== order.amountPaise ||
        payment.currency !== order.currency ||
        payment.amount_refunded > payment.amount
      ) {
        throw new AppError(
          400,
          'PAYMENT_MISMATCH',
          'Payment does not match this order.'
        );
      }
      if (order.razorpayPaymentId && order.razorpayPaymentId !== paymentId) {
        throw new AppError(
          409,
          'PAYMENT_CONFLICT',
          'Order already has a different verified payment.'
        );
      }
      if (
        event &&
        (await PaymentEventModel.exists({ eventId: event.id }).session(session))
      )
        return order.status;
      if (payment.status === 'captured' || payment.status === 'refunded') {
        if (order.status !== 'refunded') {
          const fullyRefunded = payment.amount_refunded === payment.amount;
          order.status = fullyRefunded ? 'refunded' : 'paid';
          order.razorpayPaymentId = payment.id;
          order.paidAt ??= new Date();
          order.refundedPaise = Math.max(
            order.refundedPaise,
            payment.amount_refunded
          );
          if (fullyRefunded) {
            await EntitlementModel.updateMany(
              { sourceOrderId: order._id },
              { status: 'revoked', revokedAt: new Date() },
              { session }
            );
          } else {
            await EntitlementModel.updateOne(
              {
                userId: order.userId,
                resourceType: order.itemType,
                resourceId: order.itemId,
                sourceOrderId: order._id,
              },
              {
                $setOnInsert: {
                  status: 'active',
                  grantedAt: new Date(),
                  revokedAt: null,
                },
              },
              { upsert: true, session }
            );
          }
          await order.save({ session });
        }
      } else if (
        payment.status === 'failed' &&
        !['paid', 'refunded'].includes(order.status)
      ) {
        order.status = 'failed';
        await order.save({ session });
      }
      if (event)
        await PaymentEventModel.create(
          [{ eventId: event.id, eventType: event.type }],
          { session }
        );
      return order.status;
    });
  } catch (error) {
    if (event && (await PaymentEventModel.exists({ eventId: event.id }))) {
      return (await OrderModel.findById(orderId))?.status ?? 'payment_pending';
    }
    throw error;
  }
}
export async function verifyCheckout(
  userId: string,
  input: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
) {
  const order = await OrderModel.findOne({ _id: input.orderId, userId });
  if (
    !order ||
    order.razorpayOrderId !== input.razorpay_order_id ||
    !verifySignature(
      `${order.razorpayOrderId}|${input.razorpay_payment_id}`,
      input.razorpay_signature,
      paymentConfig().secret
    )
  )
    throw new AppError(
      400,
      'INVALID_PAYMENT_SIGNATURE',
      'Payment verification failed.'
    );
  return reconcilePayment(order.id, input.razorpay_payment_id);
}
export async function reconcileOrder(orderId: string) {
  const order = await OrderModel.findById(orderId);
  if (!order?.razorpayOrderId)
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  if (order.razorpayPaymentId)
    return reconcilePayment(order.id, order.razorpayPaymentId);
  const result = z
    .object({
      items: z.array(z.object({ id: z.string(), status: z.string() })),
    })
    .parse(
      await razorpayRequest(
        `/orders/${encodeURIComponent(order.razorpayOrderId)}/payments`
      )
    );
  const captured = result.items.find((item) =>
    ['captured', 'refunded'].includes(item.status)
  );
  return captured ? reconcilePayment(order.id, captured.id) : order.status;
}
