import { HealthController } from './health.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [HealthController] })
export class HealthModule {}
