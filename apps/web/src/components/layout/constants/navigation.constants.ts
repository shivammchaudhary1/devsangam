import type { LucideIcon } from 'lucide-react';

import { BarChart3, BookOpen, Home, PlayCircle, User } from 'lucide-react';

import { APP_ROUTES } from '@/app/constants/routes.constants';

export type AppNavigationItem = {
  label: string;
  mobileLabel: string;
  path: string;
  icon: LucideIcon;
};

export const APP_NAVIGATION: readonly AppNavigationItem[] = [
  {
    label: 'Home',
    mobileLabel: 'Home',
    path: APP_ROUTES.home,
    icon: Home,
  },
  {
    label: 'Start Practice',
    mobileLabel: 'Practice',
    path: APP_ROUTES.practice,
    icon: PlayCircle,
  },
  {
    label: 'Insights',
    mobileLabel: 'Insights',
    path: APP_ROUTES.insights,
    icon: BarChart3,
  },
  {
    label: 'Library',
    mobileLabel: 'Library',
    path: APP_ROUTES.library,
    icon: BookOpen,
  },
  {
    label: 'Profile',
    mobileLabel: 'Profile',
    path: APP_ROUTES.profile,
    icon: User,
  },
];
