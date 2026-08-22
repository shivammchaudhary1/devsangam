import { getPracticeSession } from '../api/practice.api';
import { practiceQueryKeys } from '../api/practice.query-keys';
import { useQuery } from '@tanstack/react-query';

export function usePracticeSession(sessionId?: string) {
  return useQuery({
    queryKey: practiceQueryKeys.session(sessionId ?? ''),

    queryFn: () => getPracticeSession(sessionId as string),

    enabled: Boolean(sessionId),

    staleTime: 10_000,
  });
}
