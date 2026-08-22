import { practiceDb } from './practice-db';
import type { LocalPracticeSession } from './practice-local.types';
import type { PracticeSession } from '@devsangam/types';

export async function saveLocalPracticeSession(session: LocalPracticeSession) {
  await practiceDb.practiceSessions.put(session);
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
  };

  await saveLocalPracticeSession(localSession);

  return localSession;
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
