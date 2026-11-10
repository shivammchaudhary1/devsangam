import { ContactMessageModel } from '../../models/contact-message.model.ts';
import { AppError } from '../../utils/app-error.ts';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
type HttpHandler = (req: Request, res: Response) => unknown;

export const submitContactMessage: HttpHandler = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(
      503,
      'CONTACT_UNAVAILABLE',
      'Messages are temporarily unavailable. Please email us.',
    );
  }
  const { name, email, category, message } = req.body;
  try {
    await ContactMessageModel.create({ name, email, category, message });
  } catch {
    throw new AppError(
      503,
      'CONTACT_UNAVAILABLE',
      'Messages are temporarily unavailable. Please email us.',
    );
  }
  res.status(201).json({ success: true, data: { received: true } });
};
