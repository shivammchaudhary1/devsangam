import { getAllLocalPracticeSessions } from '../offline/practice-local.repository';
import { useQuery } from '@tanstack/react-query';

export const localPracticeQueryKeys = {
  all: ['local-practice'] as const,
  sessions: () => [...localPracticeQueryKeys.all, 'sessions'] as const,
};

export function useLocalPracticeSessions() {
  return useQuery({
    queryKey: localPracticeQueryKeys.sessions(),
    queryFn: getAllLocalPracticeSessions,
    staleTime: 5_000,
  });
}
