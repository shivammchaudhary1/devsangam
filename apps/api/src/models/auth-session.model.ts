import { Schema, model, type InferSchemaType } from 'mongoose';

const authSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: 'User',

      required: true,

      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    userAgent: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

authSessionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

export type AuthSession = InferSchemaType<typeof authSessionSchema>;

export const AuthSessionModel = model('AuthSession', authSessionSchema);
