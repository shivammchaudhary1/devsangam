import { practiceDb } from './practice-db';
import type { LocalPracticeSession } from './practice-local.types';
import type { PracticeSession } from '@devsangam/types';

export async function saveLocalPracticeSession(session: LocalPracticeSession) {
  const existing = await practiceDb.practiceSessions.get(session.sessionId);

  /*
   * Merge rather than blindly replacing the row.
   *
   * Runtime snapshots do not need to know about
   * serverSnapshot, so preserve it automatically
   * whenever one already exists.
   */
  await practiceDb.practiceSessions.put({
    ...existing,
    ...session,

    serverSnapshot: session.serverSnapshot ?? existing?.serverSnapshot,
  });
}

export async function getLocalPracticeSession(sessionId: string) {
  return practiceDb.practiceSessions.get(sessionId);
}

export async function getAllLocalPracticeSessions() {
  return practiceDb.practiceSessions.toArray();
}

export async function deleteLocalPracticeSession(sessionId: string) {
  await practiceDb.practiceSessions.delete(sessionId);
}

export async function createLocalPracticeSessionFromServer(
  session: PracticeSession
) {
  const now = new Date().toISOString();

  const localSession: LocalPracticeSession = {
    sessionId: session._id,

    mantraSlug: session.mantraSlug,

    targetCount: session.targetCount,

    completedCount: session.completedCount,

    activeDurationSeconds: session.activeDurationSeconds,

    status: session.status,

    startedAt: session.startedAt,

    updatedAt: now,

    lastSyncedAt: now,

    serverSnapshot: session,
  };

  await saveLocalPracticeSession(localSession);

  return localSession;
}

/*
 * Store only the latest server metadata without
 * replacing newer locally-recorded chant progress.
 */
export async function cachePracticeSessionServerSnapshot(
  session: PracticeSession
) {
  const existing = await getLocalPracticeSession(session._id);

  if (!existing) {
    return createLocalPracticeSessionFromServer(session);
  }

  await practiceDb.practiceSessions.update(session._id, {
    serverSnapshot: session,
  });

  return getLocalPracticeSession(session._id);
}

/*
 * Reconstruct the PracticeSession contract required
 * by PracticeSessionPage from IndexedDB.
 *
 * Server metadata comes from serverSnapshot while
 * mutable practice progress comes from the local
 * runtime record.
 */
export function restorePracticeSessionFromLocal(
  localSession: LocalPracticeSession
): PracticeSession | null {
  const serverSnapshot = localSession.serverSnapshot;

  if (!serverSnapshot) {
    return null;
  }

  return {
    ...serverSnapshot,

    completedCount: localSession.completedCount,

    activeDurationSeconds: localSession.activeDurationSeconds,

    status: localSession.status,

    startedAt: localSession.startedAt,

    updatedAt: localSession.updatedAt,

    completedAt:
      localSession.status === 'completed'
        ? (serverSnapshot.completedAt ?? localSession.updatedAt)
        : serverSnapshot.completedAt,
  };
}

export async function updateLocalPracticeSession(
  sessionId: string,
  changes: Partial<
    Pick<
      LocalPracticeSession,
      'completedCount' | 'activeDurationSeconds' | 'status' | 'lastSyncedAt'
    >
  >
) {
  const existing = await practiceDb.practiceSessions.get(sessionId);

  if (!existing) {
    return;
  }

  await practiceDb.practiceSessions.update(sessionId, {
    ...changes,

    updatedAt: new Date().toISOString(),
  });
}

export async function markLocalPracticeSessionSynced(sessionId: string) {
  const existing = await practiceDb.practiceSessions.get(sessionId);

  if (!existing) {
    return;
  }

  await practiceDb.practiceSessions.update(sessionId, {
    lastSyncedAt: new Date().toISOString(),
  });
}
