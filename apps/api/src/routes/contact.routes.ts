import { validateBody } from '../middleware/validate-body.ts';
import { ContactMessageModel } from '../models/contact-message.model.ts';
import { AppError } from '../utils/app-error.ts';
import { contactSchema } from '../validators/contact.schema.ts';
import express, { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';

export const contactRouter = Router();
contactRouter.post(
  '/',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Please try again later.' },
    },
  }),
  express.json({ limit: '8kb' }),
  validateBody(contactSchema),
  async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError(
        503,
        'CONTACT_UNAVAILABLE',
        'Messages are temporarily unavailable. Please email us.'
      );
    }
    const { name, email, category, message } = req.body;
    try {
      await ContactMessageModel.create({ name, email, category, message });
    } catch {
      throw new AppError(
        503,
        'CONTACT_UNAVAILABLE',
        'Messages are temporarily unavailable. Please email us.'
      );
    }
    res.status(201).json({ success: true, data: { received: true } });
  }
);
