export const APP_ROUTES = {
  home: '/',
  practice: '/practice',
  practiceSession: '/practice/:mantraSlug/session/:sessionId',
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

export function getPracticeRoute(mantraSlug?: string) {
  if (!mantraSlug) {
    return APP_ROUTES.practice;
  }

  const searchParams = new URLSearchParams({
    mantra: mantraSlug,
  });

  return `${APP_ROUTES.practice}?${searchParams.toString()}`;
}

export function getPracticeSessionRoute(mantraSlug: string, sessionId: string) {
  return `/practice/${encodeURIComponent(
    mantraSlug
  )}/session/${encodeURIComponent(sessionId)}`;
}
