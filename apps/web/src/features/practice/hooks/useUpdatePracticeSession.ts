import { updatePracticeSession } from '../api/practice.api';
import { practiceQueryKeys } from '../api/practice.query-keys';
import type {PracticeSession,UpdatePracticeSessionRequest,} from '@devsangam/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type UpdatePracticeSessionVariables = {
  sessionId: string;
  payload: UpdatePracticeSessionRequest;
};

export function useUpdatePracticeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, payload }: UpdatePracticeSessionVariables) =>
      updatePracticeSession(sessionId, payload),

    onSuccess: (session: PracticeSession) => {
      queryClient.setQueryData(practiceQueryKeys.session(session._id), session);

      void queryClient.invalidateQueries({
        queryKey: practiceQueryKeys.sessionList(),
      });
    },
  });
}
