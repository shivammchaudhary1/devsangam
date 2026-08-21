import { type InferSchemaType,model, Schema } from 'mongoose';

const passwordResetTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: 'User',

      required: true,

      index: true,
    },

    tokenHash: {
      type: String,

      required: true,

      unique: true,

      index: true,
    },

    expiresAt: {
      type: Date,

      required: true,
    },
  },
  {
    timestamps: true,
  }
);

passwordResetTokenSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

export type PasswordResetToken = InferSchemaType<
  typeof passwordResetTokenSchema
>;

export const PasswordResetTokenModel = model(
  'PasswordResetToken',
  passwordResetTokenSchema
);
