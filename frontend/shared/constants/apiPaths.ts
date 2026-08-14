export const API_PATHS = {
  AUTH: {
    LOGIN: 'users/login',
    SIGNUP: 'users/signup',
    LOGOUT: 'users/logout',
    SESSION: 'users/me',
    GOOGLE_LOGIN: 'users/google',
    FORGOT_PASSWORD: 'users/forgot-password',
    VERIFY_CODE: 'users/verify-code',
    RESET_PASSWORD: 'users/reset-password',
  },
} as const;
