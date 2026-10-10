import { SessionGuard } from '../../common/guards.ts';
import { listAccountOrders, listAccountPurchases } from '../store/store.handlers.ts';
import { Controller, Get, Header, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
@Controller('library')
@UseGuards(SessionGuard)
export class LibraryController {
  @Get('orders')
  @Header('Cache-Control', 'private, no-store')
  handle0(@Req() req: Request, @Res() res: Response) {
    res.set('Cache-Control', 'private, no-store');
    return listAccountOrders(req, res);
  }
  @Get('items')
  @Header('Cache-Control', 'private, no-store')
  handle1(@Req() req: Request, @Res() res: Response) {
    res.set('Cache-Control', 'private, no-store');
    return listAccountPurchases(req, res);
  }
}
