import { OptionalSessionGuard, SessionGuard } from '../../common/guards.ts';
import { downloadProductPdf, getPublishedProduct,listPublishedProducts } from './store.handlers.ts';
import { Controller, Get, Header, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('store')
@UseGuards(OptionalSessionGuard)
export class StoreController {
  @Get('')
  @Header('Cache-Control', 'no-store')
  listPublishedProducts(@Req() req: Request, @Res() res: Response) {
    return listPublishedProducts(req, res);
  }
  @Get(':id/file')
  @Header('Cache-Control', 'no-store')
  @UseGuards(SessionGuard)
  downloadProductPdf(@Req() req: Request, @Res() res: Response) {
    return downloadProductPdf(req, res);
  }
  @Get(':slug')
  @Header('Cache-Control', 'no-store')
  getPublishedProduct(@Req() req: Request, @Res() res: Response) {
    return getPublishedProduct(req, res);
  }
}
