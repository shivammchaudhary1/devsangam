import { getPracticeSessions } from '../api/practice.api';
import { practiceQueryKeys } from '../api/practice.query-keys';
import { useQuery } from '@tanstack/react-query';

export function usePracticeSessions() {
  return useQuery({
    queryKey: practiceQueryKeys.sessionList(),

    queryFn: getPracticeSessions,

    staleTime: 30_000,
  });
}
