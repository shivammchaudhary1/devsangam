 
import { SessionGuard } from '../../common/guards.ts';
import { ValidatedBody } from '../../common/http.ts';
import { AstroReadingModel } from '../../models/astro-reading.model.ts';
import { birthOffset, getAstroSnapshot, searchAstroPlaces } from '../../services/astro-provider.service.ts';
import { AppError } from '../../utils/app-error.ts';
import { pagination } from '../../utils/pagination.ts';
import { type AstroChartInput, astroChartSchema, astroPlaceQuerySchema } from '../../validators/astro.schema.ts';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Types } from 'mongoose';

@Controller('astro')
@UseGuards(SessionGuard)
export class AstroController {
  @Get('places')
  async searchPlaces(@Query('q') search: unknown) {
    const parsed = astroPlaceQuerySchema.safeParse({ q: search });
    if (!parsed.success) throw new AppError(400, 'INVALID_PLACE', 'Enter a valid birthplace with at least three characters.');
    return { success: true, data: { places: await searchAstroPlaces(parsed.data.q) } };
  }

  @Get('history')
  async history(@Req() req: Request) {
    const { page, limit, skip } = pagination(req.query);
    const filter = { userId: req.auth!.userId };
    const [items, total] = await Promise.all([
      AstroReadingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AstroReadingModel.countDocuments(filter),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  @Get('history/:id')
  async one(@Req() req: Request, @Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) throw new AppError(400, 'INVALID_ID', 'Invalid chart ID.');
    const item = await AstroReadingModel.findOne({ _id: id, userId: req.auth!.userId }).lean();
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Chart not found.');
    return { success: true, data: { item } };
  }

  @Post('chart')
  @HttpCode(201)
  async generate(@Req() req: Request, @ValidatedBody(astroChartSchema) payload: AstroChartInput) {
    const userId = req.auth!.userId;
    // Free tier protection: personal daily limit, in addition to the HTTP rate limiter.
    const start = new Date(); start.setUTCHours(0, 0, 0, 0);
    const today = await AstroReadingModel.countDocuments({ userId, createdAt: { $gte: start } });
    if (today >= 10) throw new AppError(429, 'ASTRO_DAILY_LIMIT', 'You have reached the daily limit of 10 saved charts. Try tomorrow.');
    const offset = birthOffset(payload.birthDate, payload.birthTime, payload.birthplace.timezone);
    const { summary, planets } = await getAstroSnapshot(payload, offset);
    const item = await AstroReadingModel.create({
      userId,
      name: payload.name,
      gender: payload.gender,
      birthDate: payload.birthDate,
      birthTime: payload.birthTime,
      birthplace: { ...payload.birthplace, birthUtcOffset: offset },
      summary, planets, consentAt: new Date(), provider: 'freeastrologyapi', ayanamsha: 'lahiri',
    });
    return { success: true, data: { item: item.toObject({ flattenMaps: true }) } };
  }

  @Delete('history/:id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) throw new AppError(400, 'INVALID_ID', 'Invalid chart ID.');
    const result = await AstroReadingModel.deleteOne({ _id: id, userId: req.auth!.userId });
    if (!result.deletedCount) throw new AppError(404, 'NOT_FOUND', 'Chart not found.');
    return { success: true, data: { deleted: true } };
  }
}
