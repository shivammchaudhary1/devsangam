import {
  completePracticeSession,
  getPracticeSession,
  updatePracticeSession,
} from '../api/practice.api';
import {
  deleteLocalPracticeSession,
  getAllLocalPracticeSessions,
  markLocalPracticeSessionSynced,
} from './practice-local.repository';
import type { LocalPracticeSession } from './practice-local.types';

let activeSyncPromise: Promise<void> | null = null;

function isBrowserOnline() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return navigator.onLine;
}

async function syncLocalPracticeSession(localSession: LocalPracticeSession) {
  /*
   * Always check the current server state first.
   *
   * This prevents an old local record from trying to modify
   * a session which has already reached a terminal state.
   */
  const serverSession = await getPracticeSession(localSession.sessionId);

  /*
   * Server terminal states are authoritative.
   *
   * If MongoDB already says completed/abandoned,
   * there is nothing left for this browser to sync.
   */
  if (
    serverSession.status === 'completed' ||
    serverSession.status === 'abandoned'
  ) {
    await deleteLocalPracticeSession(localSession.sessionId);

    return;
  }

  if (localSession.status === 'completed') {
    await completePracticeSession(localSession.sessionId, {
      completedCount: localSession.targetCount,
      activeDurationSeconds: localSession.activeDurationSeconds,
    });

    await deleteLocalPracticeSession(localSession.sessionId);

    return;
  }

  if (localSession.status === 'abandoned') {
    await updatePracticeSession(localSession.sessionId, {
      completedCount: localSession.completedCount,
      activeDurationSeconds: localSession.activeDurationSeconds,
      status: 'abandoned',
    });

    await deleteLocalPracticeSession(localSession.sessionId);

    return;
  }

  await updatePracticeSession(localSession.sessionId, {
    completedCount: localSession.completedCount,
    activeDurationSeconds: localSession.activeDurationSeconds,
    status: localSession.status,
  });

  await markLocalPracticeSessionSynced(localSession.sessionId);
}

async function performPracticeSync() {
  if (!isBrowserOnline()) {
    return;
  }

  const localSessions = await getAllLocalPracticeSessions();

  for (const localSession of localSessions) {
    if (!isBrowserOnline()) {
      return;
    }

    try {
      await syncLocalPracticeSession(localSession);
    } catch {
      /*
       * One broken/stale session must not stop the rest
       * of the synchronization queue.
       *
       * We intentionally keep the local record so a later
       * reconciliation attempt can retry it.
       */
    }
  }
}

export function syncPendingPracticeSessions() {
  if (!isBrowserOnline()) {
    return Promise.resolve();
  }

  /*
   * Prevent multiple global sync runs from overlapping.
   *
   * For example:
   * - app mounts
   * - online event fires
   * - interval fires
   *
   * All three should share one sync operation.
   */
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = performPracticeSync().finally(() => {
    activeSyncPromise = null;
  });

  return activeSyncPromise;
}
