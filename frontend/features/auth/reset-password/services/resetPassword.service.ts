import { postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export const resetPasswordService = {
  resetPassword: (token: string, password: string) =>
    postRequest<void>(API_PATHS.AUTH.RESET_PASSWORD, { token, password }),
} as const;
