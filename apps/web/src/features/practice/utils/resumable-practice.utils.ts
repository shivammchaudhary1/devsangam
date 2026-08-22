import type { LocalPracticeSession } from '../offline/practice-local.types';
import type { PracticeSession } from '@devsangam/types';

export type ResumablePracticeSession = {
  sessionId: string;
  mantraSlug: string;
  targetCount: number;
  completedCount: number;
  activeDurationSeconds: number;
  status: 'in_progress' | 'paused';
  updatedAt: string;
  source: 'local' | 'server';
};

export function getResumablePracticeSession(
  serverSessions: PracticeSession[],
  localSessions: LocalPracticeSession[]
): ResumablePracticeSession | null {
  const serverSessionsById = new Map(
    serverSessions.map((session) => [session._id, session])
  );

  const serverCandidates: ResumablePracticeSession[] = serverSessions
    .filter(
      (session) =>
        session.status === 'in_progress' || session.status === 'paused'
    )
    .map((session) => ({
      sessionId: session._id,
      mantraSlug: session.mantraSlug,
      targetCount: session.targetCount,
      completedCount: session.completedCount,
      activeDurationSeconds: session.activeDurationSeconds,
      status: session.status as 'in_progress' | 'paused',
      updatedAt: session.updatedAt,
      source: 'server',
    }));

  const localCandidates: ResumablePracticeSession[] = localSessions
    .filter((localSession) => {
      if (
        localSession.status !== 'in_progress' &&
        localSession.status !== 'paused'
      ) {
        return false;
      }

      const matchingServerSession = serverSessionsById.get(
        localSession.sessionId
      );

      /*
       * If the server already has a terminal state,
       * do not resurrect an old local session.
       */
      if (
        matchingServerSession?.status === 'completed' ||
        matchingServerSession?.status === 'abandoned'
      ) {
        return false;
      }

      return true;
    })
    .map((session) => ({
      sessionId: session.sessionId,
      mantraSlug: session.mantraSlug,
      targetCount: session.targetCount,
      completedCount: session.completedCount,
      activeDurationSeconds: session.activeDurationSeconds,
      status: session.status as 'in_progress' | 'paused',
      updatedAt: session.updatedAt,
      source: 'local',
    }));

  /*
   * If the same session exists locally and on the
   * server, prefer whichever contains the newest /
   * furthest progress.
   */
  const candidatesBySessionId = new Map<string, ResumablePracticeSession>();

  for (const candidate of [...serverCandidates, ...localCandidates]) {
    const existing = candidatesBySessionId.get(candidate.sessionId);

    if (!existing) {
      candidatesBySessionId.set(candidate.sessionId, candidate);

      continue;
    }

    const candidateUpdatedAt = new Date(candidate.updatedAt).getTime();

    const existingUpdatedAt = new Date(existing.updatedAt).getTime();

    const shouldReplace =
      candidate.completedCount > existing.completedCount ||
      (candidate.completedCount === existing.completedCount &&
        candidateUpdatedAt > existingUpdatedAt);

    if (shouldReplace) {
      candidatesBySessionId.set(candidate.sessionId, candidate);
    }
  }

  const candidates = Array.from(candidatesBySessionId.values());

  if (!candidates.length) {
    return null;
  }

  return candidates.sort((a, b) => {
    const progressDifference = b.completedCount - a.completedCount;

    if (progressDifference !== 0) {
      return progressDifference;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  })[0];
}
