import { model, Schema } from 'mongoose';

const bodySchema = new Schema({
  sign: { type: String, required: true },
  degree: { type: Number, default: null },
  house: { type: Number, default: null },
  nakshatra: { type: String, default: null },
  pada: { type: Number, default: null },
  retrograde: { type: Boolean, default: null },
}, { _id: false });

// Store only validated/small normalized results, never raw provider responses.
const navamsaSchema = new Schema({
  name: { type: String, required: true, maxlength: 20 },
  sign: { type: String, required: true, maxlength: 20 },
  house: { type: Number, default: null },
  retrograde: { type: Boolean, default: null },
}, { _id: false });

const dashaSchema = new Schema({
  lord: { type: String, required: true, maxlength: 20 },
  startsAt: { type: String, required: true, maxlength: 40 },
  endsAt: { type: String, required: true, maxlength: 40 },
}, { _id: false });

const astroReadingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, maxlength: 80 },
  gender: { type: String, required: true, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  birthDate: { type: String, required: true },
  birthTime: { type: String, required: true },
  birthplace: {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timezone: { type: String, required: true },
    birthUtcOffset: { type: Number, required: true },
  },
  summary: {
    sun: { type: bodySchema, required: true },
    moon: { type: bodySchema, required: true },
    ascendant: { type: bodySchema, required: true },
  },
  planets: { type: Map, of: bodySchema, required: true },
  extras: {
    navamsa: { type: [navamsaSchema], default: undefined },
    dasha: { type: [dashaSchema], default: undefined },
  },
  consentAt: { type: Date, required: true },
  provider: { type: String, enum: ['freeastrologyapi'], required: true },
  ayanamsha: { type: String, enum: ['lahiri'], required: true },
}, { timestamps: true, minimize: false });

astroReadingSchema.index({ userId: 1, createdAt: -1 });

export const AstroReadingModel = model('AstroReading', astroReadingSchema);
