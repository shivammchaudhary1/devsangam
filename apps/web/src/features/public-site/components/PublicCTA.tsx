'use client';

import { APP_ROUTES } from '@/app/constants/routes.constants';
import { buttonVariants } from '@/components/ui/button-variants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link } from '@/lib/navigation';

export function PublicCTA() {
  const { isAuthenticated } = useAuth();
  return (
    <Link
      to={isAuthenticated ? '/' : APP_ROUTES.auth.register}
      className={buttonVariants({ size: 'lg' })}
    >
      {isAuthenticated ? 'Open App' : 'Begin your practice'}
    </Link>
  );
}
