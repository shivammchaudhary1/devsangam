import { type InferSchemaType, model, Schema } from 'mongoose';

const practiceSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    mantraId: {
      type: Schema.Types.ObjectId,
      ref: 'Mantra',
      required: true,
      index: true,
    },

    mantraSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    targetCount: {
      type: Number,
      required: true,
      min: 1,
    },

    completedCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    activeDurationSeconds: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ['in_progress', 'paused', 'completed', 'abandoned'],
      required: true,
      default: 'in_progress',
      index: true,
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

practiceSessionSchema.index({
  userId: 1,
  createdAt: -1,
});

practiceSessionSchema.index({
  userId: 1,
  status: 1,
});

practiceSessionSchema.index({
  userId: 1,
  mantraId: 1,
  createdAt: -1,
});

export type PracticeSessionDocument = InferSchemaType<
  typeof practiceSessionSchema
>;

export const PracticeSessionModel = model(
  'PracticeSession',
  practiceSessionSchema
);
