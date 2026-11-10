import { StoreController } from './store.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [StoreController] })
export class StoreModule {}
