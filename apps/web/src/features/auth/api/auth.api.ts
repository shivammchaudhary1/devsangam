import type { AuthResponse, AuthUser } from '../types/auth.types';
import { apiRequest } from '@/services/api/client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',

    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',

    body: JSON.stringify(payload),
  });
}

export function logoutUser() {
  return apiRequest<{
    success: true;

    data: {
      loggedOut: boolean;
    };
  }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/users/me');

  return response.data.user;
}

export function forgotPassword(email: string) {
  return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',

    skipAuthRefresh: true,

    body: JSON.stringify({
      email,
    }),
  });
}

export function resetPassword(token: string, password: string) {
  return apiRequest<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',

    skipAuthRefresh: true,

    body: JSON.stringify({
      token,
      password,
    }),
  });
}

export interface ForgotPasswordResponse {
  success: true;

  data: {
    message: string;
  };
}

export interface ResetPasswordResponse {
  success: true;

  data: {
    passwordReset: boolean;
  };
}
