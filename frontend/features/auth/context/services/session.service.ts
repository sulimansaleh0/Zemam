import { sendRequest, postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export interface AuthUser {
  _id: string;
  name?: string;
  email: string;
  roles?: string[];
}

export const sessionService = {
  getSession: () =>
    sendRequest<AuthUser>(API_PATHS.AUTH.SESSION),

  logout: () =>
    postRequest<void>(API_PATHS.AUTH.LOGOUT, {}),
} as const;
