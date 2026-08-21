export const APP_ROUTES = {
  home: '/',
  practice: '/practice',
  insights: '/insights',

  library: '/library',
  libraryDetail: '/library/:slug',

  profile: '/profile',

  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
} as const;

export function getMantraDetailRoute(slug: string) {
  return `/library/${encodeURIComponent(slug)}`;
}
