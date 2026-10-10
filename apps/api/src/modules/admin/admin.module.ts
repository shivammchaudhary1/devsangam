import { AdminController } from './admin.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [AdminController] })
export class AdminModule {}
