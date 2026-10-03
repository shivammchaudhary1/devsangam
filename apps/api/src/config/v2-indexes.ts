import {
  AdminAuditModel,
  DigitalProductModel,
  EntitlementModel,
  OrderModel,
  PaymentEventModel,
} from '../models/commerce.model.ts';
import { ContactMessageModel } from '../models/contact-message.model.ts';

export async function ensureV2Indexes() {
  // Add declared indexes only. Never sync/drop existing V1 or operator indexes.
  await Promise.all([
    AdminAuditModel.createIndexes(),
    DigitalProductModel.createIndexes(),
    EntitlementModel.createIndexes(),
    OrderModel.createIndexes(),
    PaymentEventModel.createIndexes(),
    ContactMessageModel.createIndexes(),
  ]);
}
