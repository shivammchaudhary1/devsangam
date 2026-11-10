import { PracticeController } from './practice.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [PracticeController] })
export class PracticeModule {}
