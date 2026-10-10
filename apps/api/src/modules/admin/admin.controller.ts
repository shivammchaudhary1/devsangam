import { AdminGuard, AdminRateLimitGuard } from '../../common/guards.ts';
import { UploadInterceptor } from '../../common/upload.interceptor.ts';
import {
  listAdmin,
  reviewContact,
  revokeEntitlement,
  saveContent,
  unpublishContent,
  uploadProductPdf,
} from '../../controllers/admin.controller.ts';
import { getAdminMetrics } from '../../services/admin-metrics.service.ts';
import { reconcileOrder } from '../../services/payment.service.ts';
import { MAX_PDF_BYTES } from '../../services/private-asset.service.ts';
import { AppError } from '../../utils/app-error.ts';
import { idSchema } from '../../validators/commerce.schema.ts';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import multer from 'multer';

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES, files: 1, fields: 0 },
}).single('file');
const sections = ['content', 'products', 'users', 'orders', 'contact', 'entitlements', 'audit'];
function section(req: Request, write = false) {
  const value = String(req.params.section);
  if (!sections.includes(value)) throw new AppError(404, 'NOT_FOUND', 'Section not found.');
  if (write && !['content', 'products'].includes(value)) return false;
  return true;
}

@Controller('admin')
@UseGuards(AdminGuard, AdminRateLimitGuard)
export class AdminController {
  @Get('session')
  session(@Res() res: Response) {
    return res.json({ success: true, data: { authorized: true } });
  }
  @Get('metrics')
  async metrics(@Res() res: Response) {
    return res.json({ success: true, data: await getAdminMetrics() });
  }
  @Post('products/:id/file')
  @HttpCode(200)
  @UseInterceptors(new UploadInterceptor(pdfUpload))
  upload(@Req() req: Request, @Res() res: Response) {
    return uploadProductPdf(req, res);
  }
  @Post('orders/:id/reconcile')
  @HttpCode(200)
  async reconcile(@Req() req: Request, @Res() res: Response) {
    const parsed = idSchema.safeParse(req.params.id);
    if (!parsed.success) return res.status(400).json({ success: false });
    return res.json({
      success: true,
      data: { status: await reconcileOrder(parsed.data) },
    });
  }
  @Post('contact/:id/review')
  @HttpCode(200)
  review(@Req() req: Request, @Res() res: Response) {
    return reviewContact(req, res);
  }
  @Post('entitlements/:id/revoke')
  @HttpCode(200)
  revoke(@Req() req: Request, @Res() res: Response) {
    return revokeEntitlement(req, res);
  }
  @Get(':section')
  list(@Req() req: Request, @Res() res: Response) {
    section(req);
    return listAdmin(req, res);
  }
  @Post(':section')
  @HttpCode(200)
  create(@Req() req: Request, @Res() res: Response) {
    if (!section(req, true)) return res.sendStatus(405);
    return saveContent(req, res);
  }
  @Put(':section/:id')
  update(@Req() req: Request, @Res() res: Response) {
    if (!section(req, true)) return res.sendStatus(405);
    return saveContent(req, res);
  }
  @Delete(':section/:id')
  remove(@Req() req: Request, @Res() res: Response) {
    if (!section(req, true)) return res.sendStatus(405);
    return unpublishContent(req, res);
  }
}
