export const API_PATHS = {
  AUTH: {
    LOGIN: 'api/auth/login',
    SIGNUP: 'api/auth/signup',
    LOGOUT: 'api/auth/logout',
    SESSION: 'api/user/me',
    GOOGLE_LOGIN: 'api/auth/google',
    FORGOT_PASSWORD: 'api/auth/verify-email',
    VERIFY_CODE: 'api/auth/verify-otp',
    RESET_PASSWORD: 'api/auth/reset-password',
    REFRESH_TOKEN: 'api/auth/refresh-token',
    ONBOARDING: 'api/auth/onboarding',
  },
} as const;
