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

  DRIVERS: {
    LIST:          'api/user/driver',
    CREATE:        'api/user/driver',
    CHANGE_STATUS: (id: string) => `api/user/${id}/status`,
    DELETE:        (id: string) => `api/user/driver/${id}`,
    ASSIGN:        (driverId: string) => `api/user/driver/${driverId}/assign`,
    DISABLE:       (driverId: string) => `api/user/driver/${driverId}/disable`,
  },

  VEHICLES: {
    LIST:          'api/vehicle',
    DETAIL:        (id: string) => `api/vehicle/${id}`,
    CREATE:        'api/vehicle',
    CHANGE_STATUS: (id: string) => `api/vehicle/${id}/status`,
  },

  TEAMS: {
    LIST:    'api/team',
    CREATE:  'api/team',
    BY_ID:   (id: string) => `api/team/${id}`,
    STATICS: 'api/team/statics',
  },

  MANAGERS: {
    LIST:          'api/user/fleet-manager',
    CREATE:        'api/user/fleet-manager',
    DELETE:        (id: string) => `api/user/fleet-manager/${id}`,
    ASSIGN:        (id: string) => `api/user/fleet-manager/${id}/assign`,
    DISABLE:       (id: string) => `api/user/fleet-manager/${id}/disable`,
    CHANGE_STATUS: (id: string) => `api/user/${id}/status`,
  },

  USER: {
    CHANGE_STATUS: (id: string) => `api/user/${id}/status`,
  },
} as const;
