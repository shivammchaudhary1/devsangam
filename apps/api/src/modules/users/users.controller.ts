import { SessionGuard } from '../../common/guards.ts';
import { ValidatedBody } from '../../common/http.ts';
import { UploadInterceptor } from '../../common/upload.interceptor.ts';
import {
  addFavoriteMantra,
  getFavoriteMantras,
  removeFavoriteMantra,
} from '../../controllers/favorite.controller.ts';
import {
  changePassword,
  deleteMyAvatar,
  getMe,
  updateMe,
  uploadMyAvatar,
} from '../../controllers/user.controller.ts';
import { uploadAvatarFile } from '../../middleware/avatar-upload.ts';
import { changePasswordSchema } from '../../validators/user/change-password.schema.ts';
import { updateProfileSchema } from '../../validators/user/update-profile.schema.ts';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('users')
@UseGuards(SessionGuard)
export class UsersController {
  @Get('me')
  getMe(@Req() req: Request, @Res() res: Response) {
    return getMe(req, res);
  }
  @Patch('me')
  updateMe(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(updateProfileSchema) body: unknown,
  ) {
    req.body = body;
    return updateMe(req, res);
  }
  @Post('me/avatar')
  @HttpCode(200)
  @UseInterceptors(new UploadInterceptor(uploadAvatarFile))
  uploadMyAvatar(@Req() req: Request, @Res() res: Response) {
    return uploadMyAvatar(req, res);
  }
  @Delete('me/avatar')
  deleteMyAvatar(@Req() req: Request, @Res() res: Response) {
    return deleteMyAvatar(req, res);
  }
  @Patch('me/password')
  changePassword(
    @Req() req: Request,
    @Res() res: Response,
    @ValidatedBody(changePasswordSchema) body: unknown,
  ) {
    req.body = body;
    return changePassword(req, res);
  }
  @Get('me/favorites')
  getFavoriteMantras(@Req() req: Request, @Res() res: Response) {
    return getFavoriteMantras(req, res);
  }
  @Put('me/favorites/:slug')
  addFavoriteMantra(@Req() req: Request, @Res() res: Response) {
    return addFavoriteMantra(req, res);
  }
  @Delete('me/favorites/:slug')
  removeFavoriteMantra(@Req() req: Request, @Res() res: Response) {
    return removeFavoriteMantra(req, res);
  }
}
