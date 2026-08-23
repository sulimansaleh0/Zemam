import { postRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { AuthUser } from '../../context/services/session.service';

export interface OnboardingPayload {
  companyName: string;
}

export interface OnboardingResponse {
  user?: AuthUser;
  company?: {
    _id: string;
    name: string;
  };
}

export const onboardingService = {
  setupCompany: (payload: OnboardingPayload) =>
    postRequest<OnboardingResponse>(API_PATHS.AUTH.ONBOARDING, payload),
} as const;
