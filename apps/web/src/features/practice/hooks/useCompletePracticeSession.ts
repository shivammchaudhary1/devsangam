import { completePracticeSession } from '../api/practice.api';
import { practiceQueryKeys } from '../api/practice.query-keys';
import { insightsQueryKeys } from '@/features/insights/api/insights.query-keys';
import type {
  CompletePracticeSessionRequest,
  PracticeSession,
} from '@devsangam/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type CompletePracticeSessionVariables = {
  sessionId: string;

  payload: CompletePracticeSessionRequest;
};

export function useCompletePracticeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, payload }: CompletePracticeSessionVariables) =>
      completePracticeSession(sessionId, payload),

    onSuccess: (session: PracticeSession) => {
      queryClient.setQueryData(practiceQueryKeys.session(session._id), session);

      void queryClient.invalidateQueries({
        queryKey: practiceQueryKeys.sessionList(),
      });

      /*
       * Completion changes:
       *
       * - total chants
       * - completed sessions
       * - practice duration
       * - malas
       * - streaks
       * - daily activity
       * - mantra breakdown
       * - history
       */
      void queryClient.invalidateQueries({
        queryKey: insightsQueryKeys.all,
      });
    },
  });
}
