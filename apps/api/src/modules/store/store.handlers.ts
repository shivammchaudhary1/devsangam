import { DigitalProductModel, EntitlementModel, OrderModel } from '../../models/commerce.model.ts';
import { MantraModel } from '../../models/mantra.model.ts';
import { hasEntitlement } from '../../services/content-access.service.ts';
import { readPrivatePdf } from '../../services/private-asset.service.ts';
import { AppError } from '../../utils/app-error.ts';
import { pagination } from '../../utils/pagination.ts';
import { idSchema } from '../../validators/commerce.schema.ts';
import type { Request, Response } from 'express';
type HttpHandler = (req: Request, res: Response) => unknown;

export const listPublishedProducts: HttpHandler = async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = {
    published: true,
    ...(req.query.free === 'true' ? { accessType: 'free' as const } : {}),
  };
  const [products, total] = await Promise.all([
    DigitalProductModel.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DigitalProductModel.countDocuments(filter),
  ]);
  res.json({ success: true, data: { products, total, page, limit } });
};

export const downloadProductPdf: HttpHandler = async (req, res) => {
  const parsed = idSchema.safeParse(req.params.id);
  if (!parsed.success) throw new AppError(400, 'INVALID_ID', 'Invalid product.');
  const product = await DigitalProductModel.findOne({
    _id: parsed.data,
    published: true,
  }).select('+fileStorageKey');
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product unavailable.');
  if (
    product.accessType === 'paid' &&
    !(await hasEntitlement(req.auth!.userId, 'digital_product', product._id))
  ) {
    throw new AppError(403, 'CONTENT_LOCKED', 'Purchase this item to access its PDF.');
  }
  const buffer = await readPrivatePdf(product.fileStorageKey);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${product.slug}.pdf"`,
    'Cache-Control': 'private, no-store',
    'Content-Security-Policy': 'sandbox',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(buffer);
};

export const getPublishedProduct: HttpHandler = async (req, res) => {
  const product = await DigitalProductModel.findOne({
    slug: req.params.slug,
    published: true,
  }).lean();
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product unavailable.');
  res.json({
    success: true,
    data: {
      product,
      owned: await hasEntitlement(req.auth?.userId, 'digital_product', product._id),
      paymentsEnabled:
        process.env.PAYMENTS_ENABLED === 'true' &&
        (process.env.NODE_ENV !== 'production' || process.env.PRIVATE_DOWNLOADS_ENABLED === 'true'),
    },
  });
};

export const listAccountOrders: HttpHandler = async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const [orders, total] = await Promise.all([
    OrderModel.find({ userId: req.auth!.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    OrderModel.countDocuments({ userId: req.auth!.userId }),
  ]);
  res.json({ success: true, data: { orders, total, page, limit } });
};

export const listAccountPurchases: HttpHandler = async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  // Paginate grants first; never return an unbounded collection of paid resources.
  const grants = await EntitlementModel.find({
    userId: req.auth!.userId,
    status: 'active',
  })
    .sort({ grantedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const items = await Promise.all(
    grants.map(async (grant) => {
      const item =
        grant.resourceType === 'digital_product'
          ? await DigitalProductModel.findById(grant.resourceId)
              .select('title slug published')
              .lean()
          : await MantraModel.findById(grant.resourceId).select('title slug isPublished').lean();
      return {
        id: String(grant.resourceId),
        type: grant.resourceType,
        purchasedAt: grant.grantedAt,
        title: item?.title ?? 'Unavailable item',
        slug: item?.slug ?? null,
        available: item ? ('published' in item ? item.published : item.isPublished) : false,
      };
    }),
  );
  const total = await EntitlementModel.countDocuments({
    userId: req.auth!.userId,
    status: 'active',
  });
  res.json({ success: true, data: { items, total, page, limit } });
};
