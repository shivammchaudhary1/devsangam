import { type InferSchemaType, model, Schema } from 'mongoose';

const pushReminderDispatchSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: 'User',

      required: true,

      index: true,
    },

    localDate: {
      type: String,

      required: true,

      trim: true,

      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    reminderTime: {
      type: String,

      required: true,

      trim: true,

      match: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    },

    sentAt: {
      type: Date,

      default: null,
    },
  },
  {
    timestamps: true,
  }
);

pushReminderDispatchSchema.index(
  {
    userId: 1,

    localDate: 1,
  },
  {
    unique: true,
  }
);

pushReminderDispatchSchema.index(
  {
    createdAt: 1,
  },
  {
    expireAfterSeconds: 60 * 60 * 24 * 90,
  }
);

export type PushReminderDispatch = InferSchemaType<
  typeof pushReminderDispatchSchema
>;

export const PushReminderDispatchModel = model(
  'PushReminderDispatch',
  pushReminderDispatchSchema
);
