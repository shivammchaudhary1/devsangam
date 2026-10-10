import { PaymentsController } from './payments.controller.ts';
import { WebhookController } from './webhook.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [PaymentsController, WebhookController] })
export class PaymentsModule {}
