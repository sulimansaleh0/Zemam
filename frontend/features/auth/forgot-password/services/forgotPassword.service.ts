import { postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export interface ForgotPasswordResponse {
  token?: string;
}

export const forgotPasswordService = {
  requestPasswordReset: (email: string) =>
    postRequest<ForgotPasswordResponse>(API_PATHS.AUTH.FORGOT_PASSWORD, { email }),
} as const;
