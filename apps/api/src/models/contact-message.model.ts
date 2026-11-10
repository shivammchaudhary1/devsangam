import { model, Schema } from 'mongoose';

const schema = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 254 },
    category: { type: String, required: true },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'reviewed'], default: 'new' },
  },
  { timestamps: true }
);
schema.index({ createdAt: -1 });
export const ContactMessageModel = model('ContactMessage', schema);
