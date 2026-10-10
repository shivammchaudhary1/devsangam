import { AdminGuard, AdminRateLimitGuard, OptionalSessionGuard, PaymentRateLimitGuard, SessionGuard } from '../common/guards.ts';
import { ApiLifecycle } from '../common/lifecycle.ts';
import { AdminModule } from './admin/admin.module.ts';
import { AuthModule } from './auth/auth.module.ts';
import { ContactModule } from './contact/contact.module.ts';
import { HealthModule } from './health/health.module.ts';
import { InsightsModule } from './insights/insights.module.ts';
import { LibraryModule } from './library/library.module.ts';
import { MantrasModule } from './mantras/mantras.module.ts';
import { PaymentsModule } from './payments/payments.module.ts';
import { PracticeModule } from './practice/practice.module.ts';
import { PushModule } from './push/push.module.ts';
import { StoreModule } from './store/store.module.ts';
import { UsersModule } from './users/users.module.ts';
import { Global, Module } from '@nestjs/common';
@Global()
@Module({
  providers: [SessionGuard, AdminGuard, OptionalSessionGuard, AdminRateLimitGuard, PaymentRateLimitGuard],
  exports: [SessionGuard, AdminGuard, OptionalSessionGuard, AdminRateLimitGuard, PaymentRateLimitGuard],
})
class AuthorizationModule {}
@Module({
  providers: [ApiLifecycle],
  imports: [
    AuthorizationModule,
    AuthModule,
    UsersModule,
    PracticeModule,
    MantrasModule,
    InsightsModule,
    PushModule,
    HealthModule,
    ContactModule,
    StoreModule,
    PaymentsModule,
    LibraryModule,
    AdminModule,
  ],
})
export class ApiModule {}
