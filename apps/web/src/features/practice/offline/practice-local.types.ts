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
};