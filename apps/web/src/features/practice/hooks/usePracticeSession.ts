import { getPracticeSession } from '../api/practice.api';
import { practiceQueryKeys } from '../api/practice.query-keys';
import {
  cachePracticeSessionServerSnapshot,
  getLocalPracticeSession,
  restorePracticeSessionFromLocal,
} from '../offline/practice-local.repository';
import { isApiError } from '@/services/api/client';
import type { PracticeSession } from '@devsangam/types';
import { useQuery } from '@tanstack/react-query';

async function getOfflinePracticeSession(
  sessionId: string
): Promise<PracticeSession | null> {
  const localSession = await getLocalPracticeSession(sessionId);

  if (!localSession) {
    return null;
  }

  return restorePracticeSessionFromLocal(localSession);
}

async function resolvePracticeSession(
  sessionId: string
): Promise<PracticeSession> {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  /*
   * Do not make a guaranteed-to-fail network
   * request when the browser already knows it
   * is offline.
   */
  if (isOffline) {
    const localSession = await getOfflinePracticeSession(sessionId);

    if (localSession) {
      return localSession;
    }

    throw new Error(
      'This Sadhana is not available offline yet. Open it once while connected before continuing offline.'
    );
  }

  try {
    const session = await getPracticeSession(sessionId);

    /*
     * Preserve the server metadata required for
     * a future full offline reload.
     *
     * This does not overwrite newer local chant
     * progress.
     */
    await cachePracticeSessionServerSnapshot(session);

    return session;
  } catch (error) {
    /*
     * A raw network failure can still happen
     * before navigator.onLine updates.
     */
    if (!isApiError(error)) {
      const localSession = await getOfflinePracticeSession(sessionId);

      if (localSession) {
        return localSession;
      }
    }

    throw error;
  }
}

export function usePracticeSession(sessionId?: string) {
  return useQuery({
    queryKey: practiceQueryKeys.session(sessionId ?? ''),

    queryFn: () => resolvePracticeSession(sessionId as string),

    enabled: Boolean(sessionId),

    /*
     * The query function contains its own
     * offline resolution strategy.
     */
    networkMode: 'always',

    staleTime: 10_000,
  });
}
