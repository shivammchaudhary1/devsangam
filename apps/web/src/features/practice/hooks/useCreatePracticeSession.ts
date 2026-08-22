import { createPracticeSession } from '../api/practice.api';
import { practiceQueryKeys } from '../api/practice.query-keys';
import type { PracticeSession } from '@devsangam/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePracticeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPracticeSession,

    onSuccess: (session: PracticeSession) => {
      queryClient.setQueryData(practiceQueryKeys.session(session._id), session);

      void queryClient.invalidateQueries({
        queryKey: practiceQueryKeys.sessionList(),
      });
    },
  });
}
