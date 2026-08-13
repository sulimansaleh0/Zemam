import { apiClient } from '@/shared/lib/apiClient';
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  NewPasswordPayload,
  NewPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SignupPayload,
  SignupResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
} from '../types/auth.types';

// ============================================================
//  Auth API Layer — Single source of truth for auth endpoints
// ============================================================

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('auth/login', payload),

  signup: (payload: SignupPayload) =>
    apiClient.post<SignupResponse>('auth/register', payload),

  requestPasswordReset: (payload: ResetPasswordPayload) =>
    apiClient.post<ResetPasswordResponse>('auth/forgot-password', payload),

  verifyCode: (payload: VerifyCodePayload) =>
    apiClient.post<VerifyCodeResponse>('auth/verify-code', payload),

  setNewPassword: (payload: NewPasswordPayload) =>
    apiClient.post<NewPasswordResponse>('auth/reset-password', payload),

  getMe: () =>
    apiClient.get<AuthUser>('auth/me'),

  logout: () =>
    apiClient.post<void>('auth/logout', {}),
} as const;
