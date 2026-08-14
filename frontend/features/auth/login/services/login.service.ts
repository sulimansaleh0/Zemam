import { postRequest } from '@/shared/lib/coreApi';
import type { LoginPayload, LoginResponse } from '../types/login.types';
import { API_PATHS } from '@/shared/constants/apiPaths';

export const loginService = {
  login: (payload: LoginPayload) =>
    postRequest<LoginResponse>(API_PATHS.AUTH.LOGIN, payload),

  googleLogin: (credential: string) =>
    postRequest<void>(API_PATHS.AUTH.GOOGLE_LOGIN, { credential }),
} as const;
