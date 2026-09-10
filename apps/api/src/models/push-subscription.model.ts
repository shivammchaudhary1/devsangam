import { type InferSchemaType, model, Schema } from 'mongoose';

const pushSubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: 'User',

      required: true,

      index: true,
    },

    endpoint: {
      type: String,

      required: true,

      trim: true,

      maxlength: 4096,
    },

    endpointHash: {
      type: String,

      required: true,

      trim: true,

      minlength: 64,

      maxlength: 64,
    },

    keys: {
      p256dh: {
        type: String,

        required: true,

        maxlength: 4096,
      },

      auth: {
        type: String,

        required: true,

        maxlength: 1024,
      },
    },

    expirationTime: {
      type: Date,

      default: null,
    },

    userAgent: {
      type: String,

      default: null,

      trim: true,

      maxlength: 512,
    },

    lastSeenAt: {
      type: Date,

      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

pushSubscriptionSchema.index(
  {
    endpointHash: 1,
  },
  {
    unique: true,
  }
);

pushSubscriptionSchema.index({
  userId: 1,

  updatedAt: -1,
});

export type PushSubscription = InferSchemaType<typeof pushSubscriptionSchema>;

export const PushSubscriptionModel = model(
  'PushSubscription',
  pushSubscriptionSchema
);
