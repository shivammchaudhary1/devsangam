import { AUTH } from '../config/auth.ts';
import type { CookieOptions, Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const baseOptions: CookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: 'lax',
};

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string
) {
  response.cookie(AUTH.cookies.access, accessToken, {
    ...baseOptions,

    path: '/',

    maxAge: AUTH.accessToken.maxAgeMs,
  });

  response.cookie(AUTH.cookies.refresh, refreshToken, {
    ...baseOptions,

    path: '/api/v1/auth',

    maxAge: AUTH.refreshToken.maxAgeMs,
  });
}

export function clearAuthCookies(response: Response) {
  response.clearCookie(AUTH.cookies.access, {
    ...baseOptions,

    path: '/',
  });

  response.clearCookie(AUTH.cookies.refresh, {
    ...baseOptions,

    path: '/api/v1/auth',
  });
}
