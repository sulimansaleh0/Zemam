import { postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export interface VerifyCodeResponse {
  token?: string;
}

export const verifyCodeService = {
  verifyCode: (otp: string, token?: string, email?: string) =>
    postRequest<VerifyCodeResponse>(API_PATHS.AUTH.VERIFY_CODE, {
      otp,
      ...(token ? { token } : {}),
      ...(email ? { email } : {}),
    }),
} as const;
