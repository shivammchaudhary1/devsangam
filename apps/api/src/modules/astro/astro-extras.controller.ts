import { SessionGuard } from '../../common/guards.ts';
import { AstroExtraUsageModel } from '../../models/astro-extra-usage.model.ts';
import { AstroReadingModel } from '../../models/astro-reading.model.ts';
import { type AstroExtraKind,calculateAstroExtra } from '../../services/astro-extras.service.ts';
import { AppError } from '../../utils/app-error.ts';
import { Controller, Header, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Types } from 'mongoose';

const DAILY_OPTIONAL_CALLS = 6;
// Coalesce duplicate clicks within one running API process. MongoDB still
// enforces a per-account daily quota across different API processes.
const inFlight = new Map<string, Promise<unknown[]>>();

async function reserveQuota(userId: string) {
  const day = new Date().toISOString().slice(0, 10);
  let usage;
  try {
    usage = await AstroExtraUsageModel.findOneAndUpdate(
      { userId, day }, { $inc: { calls: 1 } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (!(typeof error === 'object' && error && 'code' in error && error.code === 11000)) {
      throw error;
    }
    // Two processes attempted the first upsert concurrently: the unique index
    // guarantees a single document, and this increments it without upsert.
    usage = await AstroExtraUsageModel.findOneAndUpdate(
      { userId, day }, { $inc: { calls: 1 } }, { returnDocument: 'after' },
    );
  }
  if (!usage || usage.calls > DAILY_OPTIONAL_CALLS) {
    throw new AppError(
      429, 'ASTRO_EXTRA_DAILY_LIMIT',
      'You have reached today\'s limit for extra astrology details. Please return tomorrow.',
    );
  }
}

@Controller('astro/history')
@UseGuards(SessionGuard)
export class AstroExtrasController {
  @Post(':id/extras/:kind')
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  async generate(
    @Req() request: Request,
    @Param('id') id: string,
    @Param('kind') kind: string,
  ) {
    if (kind !== 'navamsa' && kind !== 'dasha') {
      throw new AppError(400, 'INVALID_ASTRO_EXTRA', 'Unknown astrology detail.');
    }
    const feature: AstroExtraKind = kind;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid saved chart.');
    }
    const userId = request.auth!.userId;
    const reading = await AstroReadingModel.findOne({ _id: id, userId }).lean();
    if (!reading) {
      throw new AppError(404, 'NOT_FOUND', 'Saved chart not found.');
    }
    const saved = reading.extras?.[feature];
    if (Array.isArray(saved) && saved.length > 0) {
      return { success: true, data: { kind: feature, items: saved, cached: true } };
    }
    // Old/incomplete records may not have birthplace details. Do not spend
    // provider quota or send incomplete birth data to an external API.
    const birthplace = reading.birthplace;
    if (
      !birthplace ||
      !Number.isFinite(birthplace.latitude) ||
      !Number.isFinite(birthplace.longitude) ||
      !Number.isFinite(birthplace.birthUtcOffset)
    ) {
      throw new AppError(
        422, 'ASTRO_BIRTH_DETAILS_UNAVAILABLE',
        'This saved chart is missing usable birth details. Create a new chart.',
      );
    }
    const key = `${userId}:${id}:${feature}`;
    let promise = inFlight.get(key);
    if (!promise) {
      promise = (async () => {
        await reserveQuota(userId);
        const calculated = await calculateAstroExtra(feature, {
          birthDate: reading.birthDate,
          birthTime: reading.birthTime,
          birthplace: {
            latitude: birthplace.latitude,
            longitude: birthplace.longitude,
            birthUtcOffset: birthplace.birthUtcOffset,
          },
        });
        const updated = await AstroReadingModel.updateOne(
          { _id: id, userId }, { $set: { [`extras.${feature}`]: calculated } },
        );
        if (!updated.matchedCount) {
          throw new AppError(404, 'NOT_FOUND', 'Saved chart not found.');
        }
        return calculated;
      })().finally(() => { inFlight.delete(key); });
      inFlight.set(key, promise);
    }
    const items = await promise;
    return { success: true, data: { kind: feature, items, cached: false } };
  }
}
