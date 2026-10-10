import { InsightsController } from './insights.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [InsightsController] })
export class InsightsModule {}
