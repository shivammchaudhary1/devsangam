import { UsersController } from './users.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [UsersController] })
export class UsersModule {}
