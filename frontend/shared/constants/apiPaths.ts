export const API_PATHS = {
  AUTH: {
    LOGIN: 'auth/login',
    SIGNUP: 'auth/signup',
    LOGOUT: 'auth/logout',
    SESSION: 'user/me',
    GOOGLE_LOGIN: 'auth/google',
    FORGOT_PASSWORD: 'auth/verify-email',
    VERIFY_CODE: 'auth/verify-otp',
    RESET_PASSWORD: 'auth/reset-password',
  },
} as const;
