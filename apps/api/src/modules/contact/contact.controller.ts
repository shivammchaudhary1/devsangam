import { ValidatedBody } from '../../common/http.ts';
import { contactSchema } from '../../validators/contact.schema.ts';
import { submitContactMessage } from './contact.handlers.ts';
import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('contact')
export class ContactController {
  @Post('')
  @HttpCode(200)
  submitContactMessage(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(contactSchema) body: unknown,
  ) {
    req.body = body;
    return submitContactMessage(req, res);
  }
}
