# Admin dashboard file inventory

Local changes on branch version2 relative to e533652. No commit, push, deployment
or live provider/database change was performed. Ignored builds, local credentials
and temporary screenshots are excluded. The prior migration inventory remains a
historical record of the completed Next/Nest migration.

Total: 33 files (11 added, 22 modified).

## Added

- `apps/api/src/services/admin-location.service.ts`
- `apps/api/src/services/mantra-image.service.ts`
- `apps/web/src/components/shared/MantraImage.tsx`
- `apps/web/src/features/admin/AdminActivityChart.tsx`
- `apps/web/src/features/admin/AdminLocationPage.tsx`
- `apps/web/src/features/admin/ConfirmDeleteDialog.tsx`
- `apps/web/src/features/admin/MantraImagePicker.tsx`
- `apps/web/src/features/admin/admin.styles.ts`
- `docs/ADMIN_DASHBOARD.md`
- `docs/ADMIN_DASHBOARD_FILES.md`
- `scripts/admin-dashboard-smoke.mjs`

## Modified

- `.github/workflows/quality.yml`
- `README.md`
- `apps/api/package.json`
- `apps/api/src/controllers/admin.controller.ts`
- `apps/api/src/models/mantra.model.ts`
- `apps/api/src/modules/admin/admin.controller.ts`
- `apps/api/src/services/admin-metrics.service.ts`
- `apps/api/src/services/content-access.service.ts`
- `apps/api/src/tests/v2.test.ts`
- `apps/api/src/validators/commerce.schema.ts`
- `apps/web/next-env.d.ts`
- `apps/web/src/components/layout/AppShell.tsx`
- `apps/web/src/features/admin/AdminPage.tsx`
- `apps/web/src/features/admin/AdminShell.tsx`
- `apps/web/src/features/mantras/components/MantraCard.tsx`
- `apps/web/src/features/mantras/pages/MantraDetailPage.tsx`
- `docs/V2_DEPLOYMENT.md`
- `docs/V2_TODO.md`
- `package-lock.json`
- `package.json`
- `packages/types/src/mantra.ts`
- `scripts/v2-ui-smoke.mjs`

Next generated next-env.d.ts now references production route types because build
and typecheck were run; development regenerates its dev references.

Features, verification and live Cloudinary limitations: [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md).
