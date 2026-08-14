import { postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export const resetPasswordService = {
  resetPassword: (token: string, newPassword: string, confirmNewPassword: string) =>
    postRequest<void>(API_PATHS.AUTH.RESET_PASSWORD, { token, newPassword, confirmNewPassword }),
} as const;
