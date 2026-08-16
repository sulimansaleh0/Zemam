import { postRequest } from '@/shared/lib/coreApi';
import type { SignupPayload, SignupResponse } from '../types/signup.types';
import { API_PATHS } from '@/shared/constants/apiPaths';

export const signupService = {
  signup: (payload: SignupPayload) =>
    postRequest<SignupResponse>(API_PATHS.AUTH.SIGNUP, payload),
  
  googleSignup: (credential: string) =>
    postRequest<SignupResponse>(API_PATHS.AUTH.GOOGLE_LOGIN, { credential }),
} as const;
