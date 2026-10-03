import {
  listAdmin,
  reviewContact,
  revokeEntitlement,
  saveContent,
  unpublishContent,
  uploadProductPdf,
} from '../controllers/admin.controller.ts';
import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAdmin } from '../middleware/require-admin.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { getAdminMetrics } from '../services/admin-metrics.service.ts';
import { reconcileOrder } from '../services/payment.service.ts';
import { MAX_PDF_BYTES } from '../services/private-asset.service.ts';
import { idSchema } from '../validators/commerce.schema.ts';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireActiveSession, requireAdmin);
adminRouter.use(
  rateLimit({
    windowMs: 60000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
);
adminRouter.param('section', (_req, res, next, section) => {
  if (
    ![
      'content',
      'products',
      'users',
      'orders',
      'contact',
      'entitlements',
      'audit',
    ].includes(section)
  ) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Section not found.' },
    });
    return;
  }
  next();
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES, files: 1, fields: 0 },
});
adminRouter.post('/products/:id/file', upload.single('file'), uploadProductPdf);
adminRouter.post('/orders/:id/reconcile', async (req, res) => {
  const result = idSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({ success: false });
    return;
  }
  res.json({
    success: true,
    data: { status: await reconcileOrder(result.data) },
  });
});
adminRouter.post('/contact/:id/review', reviewContact);
adminRouter.post('/entitlements/:id/revoke', revokeEntitlement);
adminRouter.post('/:section', (req, res, next) => {
  if (!['content', 'products'].includes(String(req.params.section)))
    return res.sendStatus(405);
  return saveContent(req, res).catch(next);
});
adminRouter.put('/:section/:id', (req, res, next) => {
  if (!['content', 'products'].includes(String(req.params.section)))
    return res.sendStatus(405);
  return saveContent(req, res).catch(next);
});
adminRouter.delete('/:section/:id', (req, res, next) => {
  if (!['content', 'products'].includes(String(req.params.section)))
    return res.sendStatus(405);
  return unpublishContent(req, res).catch(next);
});
adminRouter.get('/metrics', async (_req, res) =>
  res.json({ success: true, data: await getAdminMetrics() })
);
adminRouter.get('/session', (_req, res) =>
  res.json({ success: true, data: { authorized: true } })
);
adminRouter.get('/:section', listAdmin);
