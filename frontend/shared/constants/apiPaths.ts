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
    ASSIGN:        (driverId: string) => `api/user/driver/${driverId}/assign-to-vehicle`,
    DISABLE:       (driverId: string) => `api/user/driver/${driverId}/remove-from-vehicle`,
    ASSIGN_TEAM:   (driverId: string) => `api/user/driver/${driverId}/assign-to-team`,
    REMOVE_TEAM:   (driverId: string) => `api/user/driver/${driverId}/remove-from-team`,
  },

  VEHICLES: {
    LIST:          'api/vehicle',
    DETAIL:        (id: string) => `api/vehicle/${id}`,
    CREATE:        'api/vehicle',
    DELETE:        (id: string) => `api/vehicle/${id}`,
    CHANGE_STATUS: (id: string) => `api/vehicle/${id}/status`,
    ASSIGN_TEAM:   (vehicleId: string) => `api/vehicle/${vehicleId}/assign-to-team`,
    REMOVE_TEAM:   (vehicleId: string) => `api/vehicle/${vehicleId}/remove-from-team`,
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
    ASSIGN:        (id: string) => `api/user/fleet-manager/${id}/team`,
    DISABLE:       (id: string) => `api/user/fleet-manager/${id}/remove-from-team`,
    CHANGE_STATUS: (id: string) => `api/user/${id}/status`,
  },

  TASKS: {
    LIST:        'api/task',
    CREATE:      'api/task',
    DETAIL:      (id: string) => `api/task/${id}`,
    DRIVER_LIST: 'api/task/driver',
    ACCEPT:      (id: string) => `api/task/${id}/accept`,
    FINISH:      (id: string) => `api/task/${id}/finish`,
  },

  USER: {
    CHANGE_STATUS: (id: string) => `api/user/${id}/status`,
  },
} as const;
