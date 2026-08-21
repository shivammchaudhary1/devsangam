export const APP_ROUTES = {
  home: '/',
  practice: '/practice',
  insights: '/insights',
  library: '/library',
  profile: '/profile',

  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
} as const;
