import { LibraryController } from './library.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [LibraryController] })
export class LibraryModule {}
