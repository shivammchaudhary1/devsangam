import { model, Schema } from 'mongoose';

// A quota record is independent of saved readings: deleting a reading does not
// reset the daily provider-call allowance. Old usage records expire automatically.
const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  calls: { type: Number, required: true, min: 0 },
}, { timestamps: true });

schema.index({ userId: 1, day: 1 }, { unique: true });
schema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const AstroExtraUsageModel = model('AstroExtraUsage', schema);
