import { APP_ROUTES } from '@/app/constants/routes.constants';
import type { LucideIcon } from 'lucide-react';
import {
 BarChart3, BookOpen, Home, PlayCircle, User 
} from 'lucide-react';

export type AppNavigationItem = {
  label: string;
  mobileLabel: string;
  path: string;
  icon: LucideIcon;
};

export const APP_NAVIGATION: readonly AppNavigationItem[] = [
  {
    label: 'Dashboard',
    mobileLabel: 'Dashboard',
    path: APP_ROUTES.dashboard,
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
