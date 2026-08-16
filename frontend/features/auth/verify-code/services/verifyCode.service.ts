import { postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export interface VerifyCodeResponse {
  token?: string;
}

export const verifyCodeService = {
  verifyCode: (token: string, otp: string) =>
    postRequest<VerifyCodeResponse>(API_PATHS.AUTH.VERIFY_CODE, { token, otp }),
} as const;
