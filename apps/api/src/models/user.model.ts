import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    preferences: {
      language: {
        type: String,
        default: 'en',
      },

      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark',
      },

      soundEnabled: {
        type: Boolean,
        default: true,
      },

      hapticEnabled: {
        type: Boolean,
        default: true,
      },

      reminderEnabled: {
        type: Boolean,
        default: false,
      },

      reminderTime: {
        type: String,
        default: null,
      },

      timezone: {
        type: String,
        default: 'UTC',
      },

      defaultTarget: {
        type: Number,
        default: 108,
      },
    },

    streak: {
      current: {
        type: Number,
        default: 0,
      },

      longest: {
        type: Number,
        default: 0,
      },

      lastPracticeDate: {
        type: Date,
        default: null,
      },
    },

    totals: {
      chants: {
        type: Number,
        default: 0,
      },

      malas: {
        type: Number,
        default: 0,
      },

      sessions: {
        type: Number,
        default: 0,
      },

      durationSeconds: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
