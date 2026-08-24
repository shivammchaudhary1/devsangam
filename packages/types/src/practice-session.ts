export type PracticeSessionStatus =
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'abandoned';

export type PracticeSession = {
  _id: string;
  userId: string;
  mantraId: string;
  mantraSlug: string;
  targetCount: number;
  completedCount: number;
  activeDurationSeconds: number;
  status: PracticeSessionStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePracticeSessionRequest = {
  mantraSlug: string;
  targetCount: number;
};

export type CreatePracticeSessionResponse = {
  success: true;
  data: {
    session: PracticeSession;
  };
};

export type PracticeSessionDetailResponse = {
  success: true;
  data: {
    session: PracticeSession;
  };
};

export type UpdatePracticeSessionRequest = {
  completedCount?: number;
  activeDurationSeconds?: number;
  status?: Extract<
    PracticeSessionStatus,
    'in_progress' | 'paused' | 'abandoned'
  >;
};

export type UpdatePracticeSessionResponse = {
  success: true;
  data: {
    session: PracticeSession;
  };
};

export type CompletePracticeSessionRequest = {
  completedCount: number;
  activeDurationSeconds: number;
};

export type CompletePracticeSessionResponse = {
  success: true;
  data: {
    session: PracticeSession;
  };
};

export type PracticeSessionListResponse = {
  success: true;
  data: {
    sessions: PracticeSession[];
  };
};
