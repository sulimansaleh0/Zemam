export const API_PATHS = {
  AUTH: {
    LOGIN: 'auth/login',
    SIGNUP: 'auth/signup',
    LOGOUT: 'auth/logout',
    SESSION: 'auth/me',
    GOOGLE_LOGIN: 'auth/google',
    FORGOT_PASSWORD: 'auth/forgot-password',
    VERIFY_CODE: 'auth/verify-code',
    RESET_PASSWORD: 'auth/reset-password',
  },
} as const;
