import { type InferSchemaType,model, Schema } from 'mongoose';

const mantraSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    sanskrit: {
      type: String,
      required: true,
      trim: true,
    },

    transliteration: {
      type: String,
      required: true,
      trim: true,
    },

    meaning: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
      trim: true,
    },

    benefits: {
      type: [String],
      default: [],
    },

    categories: {
      type: [String],
      default: [],
      index: true,
    },

    deity: {
      type: String,
      default: null,
      trim: true,
    },

    image: {
      type: String,
      default: null,
      trim: true,
    },

    defaultTargets: {
      type: [Number],
      default: [108],
    },

    estimatedSecondsPerChant: {
      type: Number,
      default: null,
      min: 1,
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

mantraSchema.index(
  {
    title: 'text',
    sanskrit: 'text',
    transliteration: 'text',
    meaning: 'text',
    description: 'text',
    deity: 'text',
    categories: 'text',
  },
  {
    weights: {
      title: 10,
      transliteration: 8,
      sanskrit: 8,
      deity: 6,
      categories: 4,
      meaning: 2,
      description: 1,
    },
    name: 'mantra_search_index',
  }
);

export type MantraDocument = InferSchemaType<typeof mantraSchema>;

export const MantraModel = model('Mantra', mantraSchema);
