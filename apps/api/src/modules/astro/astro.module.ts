import { AstroController } from './astro.controller.ts';
import { AstroExtrasController } from './astro-extras.controller.ts';
import { Module } from '@nestjs/common';

@Module({ controllers: [AstroController, AstroExtrasController] })
export class AstroModule {}
