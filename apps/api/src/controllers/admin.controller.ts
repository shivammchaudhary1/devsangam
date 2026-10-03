import {
  AdminAuditModel,
  DigitalProductModel,
  EntitlementModel,
  OrderModel,
} from '../models/commerce.model.ts';
import { ContactMessageModel } from '../models/contact-message.model.ts';
import { MantraModel } from '../models/mantra.model.ts';
import { UserModel } from '../models/user.model.ts';
import { storePrivatePdf } from '../services/private-asset.service.ts';
import { AppError } from '../utils/app-error.ts';
import { pagination } from '../utils/pagination.ts';
import {
  idSchema,
  mantraAdminSchema,
  productSchema,
} from '../validators/commerce.schema.ts';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

function id(req: Request) {
  const parsed = idSchema.safeParse(req.params.id);
  if (!parsed.success)
    throw new AppError(400, 'INVALID_ID', 'Invalid resource identifier.');
  return parsed.data;
}
export async function listAdmin(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req.query);
  const section = String(req.params.section);
  // Every collection has an explicit safe projection; never serialize whole users.
  const collections = {
    content: { model: MantraModel, fields: '-__v' },
    products: { model: DigitalProductModel, fields: '+fileStorageKey -__v' },
    users: { model: UserModel, fields: 'name email role createdAt' },
    orders: { model: OrderModel, fields: '-__v' },
    contact: { model: ContactMessageModel, fields: '-__v' },
    entitlements: { model: EntitlementModel, fields: '-__v' },
    audit: { model: AdminAuditModel, fields: '-__v' },
  };
  if (!(section in collections))
    throw new AppError(404, 'NOT_FOUND', 'Section not found.');
  const source = collections[section as keyof typeof collections];
  // Separate queries keep each model's inferred types intact.
  const model = source.model as mongoose.Model<unknown>;
  const [raw, total] = await Promise.all([
    model
      .find()
      .select(source.fields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(),
  ]);
  const items = raw.map((item) => {
    const record = item as Record<string, unknown>;
    if (section !== 'products') return record;
    const { fileStorageKey, ...safe } = record;
    return { ...safe, hasFile: Boolean(fileStorageKey) };
  });
  res.json({ success: true, data: { items, total, page, limit } });
}
export async function saveContent(req: Request, res: Response) {
  const product = req.params.section === 'products';
  const schema = product ? productSchema : mantraAdminSchema;
  const result = schema.safeParse(req.body);
  if (!result.success)
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Invalid content fields or price.'
    );
  const resourceId = req.params.id ? id(req) : undefined;
  const model = (
    product ? DigitalProductModel : MantraModel
  ) as mongoose.Model<unknown>;
  const saved = await mongoose.connection.transaction(async (session) => {
    const record = resourceId
      ? await model
          .findById(resourceId)
          .select('+fileStorageKey')
          .session(session)
      : null;
    if (resourceId && !record)
      throw new AppError(404, 'NOT_FOUND', 'Content not found.');
    if (
      product &&
      'published' in result.data &&
      result.data.published &&
      !record?.get('fileStorageKey')
    ) {
      throw new AppError(
        400,
        'FILE_REQUIRED',
        'Upload a PDF before publishing.'
      );
    }
    const document = record ?? new model();
    document.set(result.data);
    await document.save({ session });
    await AdminAuditModel.create(
      [
        {
          adminUserId: req.auth!.userId,
          action: record ? 'content.updated' : 'content.created',
          targetType: product ? 'digital_product' : 'mantra',
          targetId: document.id,
          metadata: {
            accessType: result.data.accessType,
            pricePaise: result.data.pricePaise,
            published:
              'published' in result.data
                ? result.data.published
                : result.data.isPublished,
          },
        },
      ],
      { session }
    );
    return document.id;
  });
  res
    .status(resourceId ? 200 : 201)
    .json({ success: true, data: { id: saved } });
}
export async function unpublishContent(req: Request, res: Response) {
  const product = req.params.section === 'products';
  const model = (
    product ? DigitalProductModel : MantraModel
  ) as mongoose.Model<unknown>;
  await mongoose.connection.transaction(async (session) => {
    const record = await model.findByIdAndUpdate(
      id(req),
      { $set: product ? { published: false } : { isPublished: false } },
      { session }
    );
    if (!record) throw new AppError(404, 'NOT_FOUND', 'Content not found.');
    await AdminAuditModel.create(
      [
        {
          adminUserId: req.auth!.userId,
          action: 'content.unpublished',
          targetType: product ? 'digital_product' : 'mantra',
          targetId: record.id,
        },
      ],
      { session }
    );
  });
  res.json({ success: true, data: { unpublished: true } });
}
export async function uploadProductPdf(req: Request, res: Response) {
  const productId = id(req);
  if (!(await DigitalProductModel.exists({ _id: productId })))
    throw new AppError(404, 'NOT_FOUND', 'Product not found.');
  if (!req.file)
    throw new AppError(400, 'FILE_REQUIRED', 'A PDF file is required.');
  const key = await storePrivatePdf(req.file.buffer);
  await mongoose.connection.transaction(async (session) => {
    await DigitalProductModel.updateOne(
      { _id: productId },
      { fileStorageKey: key },
      { session }
    );
    await AdminAuditModel.create(
      [
        {
          adminUserId: req.auth!.userId,
          action: 'product.file.updated',
          targetType: 'digital_product',
          targetId: productId,
        },
      ],
      { session }
    );
  });
  res.json({ success: true, data: { uploaded: true } });
}
export async function reviewContact(req: Request, res: Response) {
  await mongoose.connection.transaction(async (session) => {
    const record = await ContactMessageModel.findByIdAndUpdate(
      id(req),
      { status: 'reviewed' },
      { session }
    );
    if (!record) throw new AppError(404, 'NOT_FOUND', 'Message not found.');
    await AdminAuditModel.create(
      [
        {
          adminUserId: req.auth!.userId,
          action: 'contact.reviewed',
          targetType: 'contact',
          targetId: record.id,
        },
      ],
      { session }
    );
  });
  res.json({ success: true, data: { reviewed: true } });
}
export async function revokeEntitlement(req: Request, res: Response) {
  await mongoose.connection.transaction(async (session) => {
    const record = await EntitlementModel.findByIdAndUpdate(
      id(req),
      { status: 'revoked', revokedAt: new Date() },
      { session }
    );
    if (!record) throw new AppError(404, 'NOT_FOUND', 'Entitlement not found.');
    await AdminAuditModel.create(
      [
        {
          adminUserId: req.auth!.userId,
          action: 'entitlement.revoked',
          targetType: 'entitlement',
          targetId: record.id,
        },
      ],
      { session }
    );
  });
  res.json({ success: true, data: { revoked: true } });
}
