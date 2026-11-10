import { model, Schema } from 'mongoose';

const objectId = Schema.Types.ObjectId;
const productSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, maxlength: 180 },
    description: { type: String, required: true, maxlength: 6000 },
    shortDescription: { type: String, required: true, maxlength: 400 },
    coverImage: { type: String, default: null, maxlength: 1000 },
    assetType: { type: String, enum: ['pdf'], default: 'pdf' },
    fileStorageKey: { type: String, default: null, select: false },
    accessType: { type: String, enum: ['free', 'paid'], default: 'free' },
    pricePaise: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);
productSchema.index({ published: 1, featured: -1, createdAt: -1 });
export const DigitalProductModel = model('DigitalProduct', productSchema);

const orderSchema = new Schema(
  {
    userId: { type: objectId, ref: 'User', required: true },
    itemType: {
      type: String,
      enum: ['mantra', 'digital_product'],
      required: true,
    },
    itemId: { type: objectId, required: true },
    title: { type: String, required: true },
    amountPaise: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'payment_pending', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    razorpayOrderId: { type: String, default: undefined },
    razorpayPaymentId: { type: String, default: undefined },
    paidAt: { type: Date, default: null },
    refundedPaise: { type: Number, default: 0 },
  },
  { timestamps: true }
);
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
orderSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
export const OrderModel = model('Order', orderSchema);

const entitlementSchema = new Schema(
  {
    userId: { type: objectId, ref: 'User', required: true },
    sourceOrderId: { type: objectId, ref: 'Order', required: true },
    resourceType: {
      type: String,
      enum: ['mantra', 'digital_product'],
      required: true,
    },
    resourceId: { type: objectId, required: true },
    status: { type: String, enum: ['active', 'revoked'], default: 'active' },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
// A second verified purchase remains independent from a refunded first purchase.
entitlementSchema.index(
  { userId: 1, resourceType: 1, resourceId: 1, sourceOrderId: 1 },
  { unique: true }
);
entitlementSchema.index({ userId: 1, status: 1 });
export const EntitlementModel = model('Entitlement', entitlementSchema);

const auditSchema = new Schema(
  {
    adminUserId: { type: objectId, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);
auditSchema.index({ createdAt: -1 });
export const AdminAuditModel = model('AdminAudit', auditSchema);

const eventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
  },
  { timestamps: true }
);
export const PaymentEventModel = model('PaymentEvent', eventSchema);
