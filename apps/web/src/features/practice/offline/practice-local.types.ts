import type { PracticeSession } from '@devsangam/types';

export type LocalPracticeSessionStatus =
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'abandoned';

export type LocalPracticeSession = {
  sessionId: string;
  mantraSlug: string;
  targetCount: number;
  completedCount: number;
  activeDurationSeconds: number;
  status: LocalPracticeSessionStatus;
  startedAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;

  /*
   * Last server representation of the session.
   *
   * Runtime progress continues to live in the
   * fields above. This snapshot only supplies
   * server metadata needed to reconstruct a
   * PracticeSession after a full offline reload.
   *
   * Optional so existing IndexedDB rows from
   * database version 1 remain valid.
   */
  serverSnapshot?: PracticeSession;
};
