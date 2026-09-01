import { sendRequest, postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export interface AuthUser {
  _id: string;
  name?: string;
  email: string;
  role?: string;
  roles?: string[];
  companyId?: string;
  teamId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionResponse {
  user: AuthUser;
}

export const sessionService = {
  getSession: () =>
    sendRequest<SessionResponse>(API_PATHS.AUTH.SESSION),

  logout: () =>
    postRequest<void>(API_PATHS.AUTH.LOGOUT, {}),
} as const;
