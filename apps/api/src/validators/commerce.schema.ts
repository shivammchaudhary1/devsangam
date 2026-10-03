import { z } from 'zod';

export const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
const price = z.number().int().min(0).max(100000000);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(180);
const image = z.union([z.url().startsWith('https://').max(1000), z.null()]);
export const productSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    slug,
    description: z.string().trim().min(10).max(6000),
    shortDescription: z.string().trim().min(5).max(400),
    coverImage: image.default(null),
    accessType: z.enum(['free', 'paid']).default('free'),
    pricePaise: price.default(0),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),
  })
  .strict()
  .refine(
    (value) =>
      value.accessType === 'free'
        ? value.pricePaise === 0
        : value.pricePaise > 0,
    {
      message:
        'Free items must cost zero; paid items need a positive price in paise.',
    }
  );
export const mantraAdminSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    slug,
    sanskrit: z.string().trim().min(1).max(6000),
    transliteration: z.string().trim().min(1).max(6000),
    meaning: z.string().trim().min(1).max(6000),
    description: z.string().max(6000).nullable().default(null),
    benefits: z.array(z.string().max(500)).max(30).default([]),
    categories: z.array(z.string().max(80)).max(20).default([]),
    deity: z.string().max(160).nullable().default(null),
    image: image.default(null),
    defaultTargets: z
      .array(z.number().int().min(1).max(100000))
      .min(1)
      .max(10)
      .default([108]),
    estimatedSecondsPerChant: z
      .number()
      .int()
      .min(1)
      .max(3600)
      .nullable()
      .default(null),
    isPublished: z.boolean().default(true),
    accessType: z.enum(['free', 'paid']).default('free'),
    pricePaise: price.default(0),
  })
  .strict()
  .refine(
    (value) =>
      value.accessType === 'free'
        ? value.pricePaise === 0
        : value.pricePaise > 0,
    { message: 'Invalid access price.' }
  );
export const createOrderSchema = z
  .object({ itemType: z.enum(['mantra', 'digital_product']), itemId: idSchema })
  .strict();
export const verifyPaymentSchema = z
  .object({
    orderId: idSchema,
    razorpay_order_id: z
      .string()
      .regex(/^order_[a-zA-Z0-9]+$/)
      .max(100),
    razorpay_payment_id: z
      .string()
      .regex(/^pay_[a-zA-Z0-9]+$/)
      .max(100),
    razorpay_signature: z.string().regex(/^[a-f\d]{64}$/i),
  })
  .strict();
