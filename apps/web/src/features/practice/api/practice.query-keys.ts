export const practiceQueryKeys = {
  all: ['practice'] as const,

  sessions: () => [...practiceQueryKeys.all, 'sessions'] as const,

  sessionList: () => [...practiceQueryKeys.sessions(), 'list'] as const,

  session: (sessionId: string) =>
    [...practiceQueryKeys.sessions(), 'detail', sessionId] as const,
};
