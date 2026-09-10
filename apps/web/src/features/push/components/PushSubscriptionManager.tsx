import { useAuth } from '@/features/auth/hooks/useAuth';
import { synchronizeExistingPushSubscription } from '@/features/push/services/push-notifications.service';
import { useEffect } from 'react';

export function PushSubscriptionManager() {
  const auth = useAuth();

  const userId = auth.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      return;
    }

    function reconcileSubscription() {
      void synchronizeExistingPushSubscription().catch(() => {
        /*
         * Reconciliation is best-effort. The Settings
         * screen exposes actionable errors to the user.
         */
      });
    }

    reconcileSubscription();

    window.addEventListener('online', reconcileSubscription);

    return () => {
      window.removeEventListener('online', reconcileSubscription);
    };
  }, [userId]);

  return null;
}
