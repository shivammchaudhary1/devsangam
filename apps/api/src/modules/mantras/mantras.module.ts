import { MantrasController } from './mantras.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [MantrasController] })
export class MantrasModule {}
