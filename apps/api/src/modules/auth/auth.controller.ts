import { ValidatedBody } from '../../common/http.ts';
import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from '../../controllers/auth.controller.ts';
import { forgotPasswordSchema } from '../../validators/auth/forgot-password.schema.ts';
import { loginSchema } from '../../validators/auth/login.schema.ts';
import { registerSchema } from '../../validators/auth/register.schema.ts';
import { resetPasswordSchema } from '../../validators/auth/reset-password.schema.ts';
import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('register')
  @HttpCode(200)
  register(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(registerSchema) body: unknown,
  ) {
    req.body = body;
    return register(req, res);
  }
  @Post('login')
  @HttpCode(200)
  login(@Req() req: Request, @Res() res: Response, @ValidatedBody(loginSchema) body: unknown) {
    req.body = body;
    return login(req, res);
  }
  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() req: Request, @Res() res: Response) {
    return refresh(req, res);
  }
  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request, @Res() res: Response) {
    return logout(req, res);
  }
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(forgotPasswordSchema) body: unknown,
  ) {
    req.body = body;
    return forgotPassword(req, res);
  }
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(resetPasswordSchema) body: unknown,
  ) {
    req.body = body;
    return resetPassword(req, res);
  }
}
