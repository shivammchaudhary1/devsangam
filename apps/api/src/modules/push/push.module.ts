import { PushController } from './push.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [PushController] })
export class PushModule {}
