import { postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export interface VerifyCodeResponse {
  token?: string;
}

export const verifyCodeService = {
  verifyCode: (token: string, code: string, email?: string) =>
    postRequest<VerifyCodeResponse>(API_PATHS.AUTH.VERIFY_CODE, { token, code, email }),
} as const;
