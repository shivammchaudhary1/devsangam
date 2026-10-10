import { ContactController } from './contact.controller.ts';
import { Module } from '@nestjs/common';
@Module({ controllers: [ContactController] })
export class ContactModule {}
