import type {
  AuthResponse,
  AuthUser,
  ProfileIntention,
} from '../types/auth.types';
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

export interface UpdateCurrentUserPayload {
  name?: string;

  bio?: string | null;

  intention?: ProfileIntention | null;

  preferences?: Partial<AuthUser['preferences']>;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
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

export interface ChangePasswordResponse {
  success: true;

  data: {
    passwordChanged: boolean;
  };
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

export async function updateCurrentUser(
  payload: UpdateCurrentUserPayload
): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/users/me', {
    method: 'PATCH',

    body: JSON.stringify(payload),
  });

  return response.data.user;
}

export async function uploadCurrentUserAvatar(file: File): Promise<AuthUser> {
  const formData = new FormData();

  formData.append('avatar', file);

  const response = await apiRequest<AuthResponse>('/users/me/avatar', {
    method: 'POST',

    body: formData,
  });

  return response.data.user;
}

export async function deleteCurrentUserAvatar(): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/users/me/avatar', {
    method: 'DELETE',
  });

  return response.data.user;
}

export function changeCurrentUserPassword(payload: ChangePasswordPayload) {
  return apiRequest<ChangePasswordResponse>('/users/me/password', {
    method: 'PATCH',

    body: JSON.stringify(payload),
  });
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
