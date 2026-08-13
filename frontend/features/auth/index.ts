// ============================================================
//  Auth Feature — Barrel Export
//  تصدير جميع المكونات والـ schemas والأنواع لكل feature فرعية
// ============================================================

// Context & Auth Hook
export { AuthProvider, useAuth, type AuthStatus, type AuthState } from './context/AuthContext';

// API & Types المشتركة
export { authApi } from './api/auth.api';
export type {
  AddressDetails,
  LoginPayload,
  SignupPayload,
  ResetPasswordPayload,
  VerifyCodePayload,
  NewPasswordPayload,
  AuthUser,
  LoginResponse,
  SignupResponse,
  ResetPasswordResponse,
  VerifyCodeResponse,
  NewPasswordResponse,
} from './types/auth.types';

// Shared Components
export { AuthCard } from './components/AuthCard';
export { AuthHeader } from './components/AuthHeader';
export { PasswordStrength } from './components/PasswordStrength';
