import { AuthController } from './auth.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [AuthController] })
export class AuthModule {}
