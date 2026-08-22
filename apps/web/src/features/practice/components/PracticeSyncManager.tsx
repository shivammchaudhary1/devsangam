import { syncPendingPracticeSessions } from '../offline/practice-sync.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect } from 'react';

const BACKGROUND_SYNC_INTERVAL_MS = 30_000;

export function PracticeSyncManager() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user) {
      return;
    }

    function synchronizePractice() {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }

      void syncPendingPracticeSessions();
    }

    /*
     * Reconcile immediately after the authenticated
     * application starts.
     */
    synchronizePractice();

    /*
     * Reconcile whenever connectivity returns.
     */
    window.addEventListener('online', synchronizePractice);

    /*
     * Also retry occasionally while the application
     * remains open.
     */
    const intervalId = window.setInterval(
      synchronizePractice,
      BACKGROUND_SYNC_INTERVAL_MS
    );

    return () => {
      window.removeEventListener('online', synchronizePractice);

      window.clearInterval(intervalId);
    };
  }, [auth.isAuthenticated, auth.user]);

  return null;
}
