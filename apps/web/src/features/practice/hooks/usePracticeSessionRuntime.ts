import {
  createLocalPracticeSessionFromServer,
  deleteLocalPracticeSession,
  getLocalPracticeSession,
  saveLocalPracticeSession,
  updateLocalPracticeSession,
} from '../offline/practice-local.repository';
import type {
  LocalPracticeSession,
  LocalPracticeSessionStatus,
} from '../offline/practice-local.types';
import { cancelHaptic, triggerChantHaptic } from '../utils/practice-haptics';
import {
  MALA_SIZE,
  SERVER_SYNC_INTERVAL_MS,
} from '../utils/practice-session.utils';
import { useCompletePracticeSession } from './useCompletePracticeSession';
import { useUpdatePracticeSession } from './useUpdatePracticeSession';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import type { PracticeSession } from '@devsangam/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

type UsePracticeSessionRuntimeOptions = {
  session: PracticeSession;

  defaultHapticEnabled: boolean;

  startOm: () => void;

  pauseOm: () => void;

  resumeOm: () => void;

  stopOm: () => void;

  playTapTone: () => void;
};

export function usePracticeSessionRuntime({
  session,
  defaultHapticEnabled,
  startOm,
  pauseOm,
  resumeOm,
  stopOm,
  playTapTone,
}: UsePracticeSessionRuntimeOptions) {
  const navigate = useNavigate();

  const { mutateAsync: updatePracticeSession, isPending: isUpdatePending } =
    useUpdatePracticeSession();

  const {
    mutateAsync: completePracticeSession,
    isPending: isCompletePending,
    isError: isCompleteError,
  } = useCompletePracticeSession();

  const [count, setCount] = useState(session.completedCount);

  const [elapsedSeconds, setElapsedSeconds] = useState(
    session.activeDurationSeconds
  );

  const [isPaused, setIsPaused] = useState(session.status === 'paused');

  const [hapticEnabled, setHapticEnabled] = useState(
    () => defaultHapticEnabled
  );

  const [isHydrated, setIsHydrated] = useState(false);

  const [localStatus, setLocalStatus] = useState<LocalPracticeSessionStatus>(
    session.status
  );

  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  /*
   * Runtime refs.
   *
   * The chant handler and timers use refs so they
   * always operate on the latest progress values
   * without waiting for React state updates.
   */
  const countRef = useRef(session.completedCount);

  const elapsedSecondsRef = useRef(session.activeDurationSeconds);

  const pausedRef = useRef(session.status === 'paused');

  const statusRef = useRef<LocalPracticeSessionStatus>(session.status);

  const completionSyncInProgressRef = useRef(false);

  const target = session.targetCount;

  /*
   * Group the derived session metrics in one memo.
   *
   * This keeps the calculation centralized and means
   * timer-only renders do not recreate this object
   * when the chant count has not changed.
   */
  const metrics = useMemo(() => {
    const remaining = Math.max(target - count, 0);

    const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;

    const totalMalaRounds = Math.max(1, Math.ceil(target / MALA_SIZE));

    const currentMalaRound =
      count >= target
        ? totalMalaRounds
        : Math.min(Math.floor(count / MALA_SIZE) + 1, totalMalaRounds);

    const malaProgressCount =
      count >= target ? target % MALA_SIZE || MALA_SIZE : count % MALA_SIZE;

    return {
      remaining,
      progress,
      totalMalaRounds,
      currentMalaRound,
      malaProgressCount,
    };
  }, [count, target]);

  const isBusy = isUpdatePending || isCompletePending;

  /*
   * Store the current runtime state locally.
   */
  const persistLocalSnapshot = useCallback(
    async (changes: Partial<LocalPracticeSession> = {}) => {
      const existing = await getLocalPracticeSession(session._id);

      const snapshot: LocalPracticeSession = {
        sessionId: session._id,
        mantraSlug: session.mantraSlug,
        targetCount: session.targetCount,

        completedCount: countRef.current,

        activeDurationSeconds: elapsedSecondsRef.current,

        status: statusRef.current,

        startedAt: session.startedAt,

        updatedAt: new Date().toISOString(),

        lastSyncedAt: existing?.lastSyncedAt ?? null,

        ...changes,
      };

      await saveLocalPracticeSession(snapshot);
    },
    [session._id, session.mantraSlug, session.startedAt, session.targetCount]
  );

  /*
   * Sync an unfinished session snapshot.
   */
  const syncProgressToServer = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    if (
      statusRef.current === 'completed' ||
      statusRef.current === 'abandoned'
    ) {
      return false;
    }

    try {
      await updatePracticeSession({
        sessionId: session._id,

        payload: {
          completedCount: countRef.current,

          activeDurationSeconds: elapsedSecondsRef.current,

          status: pausedRef.current ? 'paused' : 'in_progress',
        },
      });

      await updateLocalPracticeSession(session._id, {
        completedCount: countRef.current,

        activeDurationSeconds: elapsedSecondsRef.current,

        status: statusRef.current,

        lastSyncedAt: new Date().toISOString(),
      });

      setSyncMessage(null);

      return true;
    } catch {
      setSyncMessage(
        'Practice saved on this device. Server sync will retry automatically.'
      );

      return false;
    }
  }, [session._id, updatePracticeSession]);

  /*
   * Sync a locally completed session.
   */
  const syncCompletionToServer = useCallback(async () => {
    if (completionSyncInProgressRef.current) {
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    if (statusRef.current !== 'completed') {
      return;
    }

    completionSyncInProgressRef.current = true;

    try {
      await completePracticeSession({
        sessionId: session._id,

        payload: {
          completedCount: target,

          activeDurationSeconds: elapsedSecondsRef.current,
        },
      });

      await deleteLocalPracticeSession(session._id);

      setSyncMessage(null);
    } catch {
      setSyncMessage(
        'Sadhana completed on this device. It will sync when your connection is available.'
      );
    } finally {
      completionSyncInProgressRef.current = false;
    }
  }, [completePracticeSession, session._id, target]);

  /*
   * Restore latest local progress.
   */
  useEffect(() => {
    let cancelled = false;

    void getLocalPracticeSession(session._id).then(async (localSession) => {
      if (cancelled) {
        return;
      }

      if (!localSession) {
        await createLocalPracticeSessionFromServer(session);

        if (!cancelled) {
          setIsHydrated(true);
        }

        return;
      }

      const serverUpdatedAt = new Date(session.updatedAt).getTime();

      const localUpdatedAt = new Date(localSession.updatedAt).getTime();

      const shouldUseLocal =
        localUpdatedAt > serverUpdatedAt ||
        localSession.completedCount > session.completedCount;

      if (shouldUseLocal) {
        countRef.current = localSession.completedCount;

        elapsedSecondsRef.current = localSession.activeDurationSeconds;

        pausedRef.current = localSession.status === 'paused';

        statusRef.current = localSession.status;

        setCount(localSession.completedCount);

        setElapsedSeconds(localSession.activeDurationSeconds);

        setIsPaused(localSession.status === 'paused');

        setLocalStatus(localSession.status);
      } else {
        countRef.current = session.completedCount;

        elapsedSecondsRef.current = session.activeDurationSeconds;

        pausedRef.current = session.status === 'paused';

        statusRef.current = session.status;

        await createLocalPracticeSessionFromServer(session);
      }

      if (!cancelled) {
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  /*
   * Browser online/offline events.
   */
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);

      if (statusRef.current === 'completed') {
        void syncCompletionToServer();

        return;
      }

      void syncProgressToServer();
    }

    function handleOffline() {
      setIsOffline(true);

      setSyncMessage(
        'You are offline. Your chanting is still being saved on this device.'
      );
    }

    window.addEventListener('online', handleOnline);

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);

      window.removeEventListener('offline', handleOffline);
    };
  }, [syncCompletionToServer, syncProgressToServer]);

  /*
   * Active session timer.
   */
  useEffect(() => {
    if (
      !isHydrated ||
      isPaused ||
      localStatus === 'completed' ||
      localStatus === 'abandoned'
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      elapsedSecondsRef.current += 1;

      setElapsedSeconds(elapsedSecondsRef.current);

      /*
       * Save timer progress locally every
       * five seconds.
       */
      if (elapsedSecondsRef.current % 5 === 0) {
        void updateLocalPracticeSession(session._id, {
          completedCount: countRef.current,

          activeDurationSeconds: elapsedSecondsRef.current,

          status: statusRef.current,
        });
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isHydrated, isPaused, localStatus, session._id]);

  /*
   * Periodically synchronize progress.
   *
   * There is intentionally no server request
   * for every chant.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (
        statusRef.current === 'in_progress' ||
        statusRef.current === 'paused'
      ) {
        void syncProgressToServer();
      }
    }, SERVER_SYNC_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isHydrated, syncProgressToServer]);

  /*
   * Save the latest state whenever the tab
   * becomes hidden.
   */
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'hidden') {
        return;
      }

      void persistLocalSnapshot();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [persistLocalSnapshot]);

  /*
   * Register one valid chant.
   */
  const handleChant = useCallback(async () => {
    if (
      !isHydrated ||
      isPaused ||
      localStatus === 'completed' ||
      localStatus === 'abandoned'
    ) {
      return;
    }

    if (countRef.current >= target) {
      return;
    }

    const nextCount = Math.min(countRef.current + 1, target);

    countRef.current = nextCount;

    setCount(nextCount);

    /*
     * Audio hooks safely decide whether
     * playback should actually occur.
     */
    startOm();

    playTapTone();

    if (hapticEnabled) {
      triggerChantHaptic();
    }

    if (nextCount === target) {
      stopOm();

      cancelHaptic();

      statusRef.current = 'completed';

      pausedRef.current = true;

      setLocalStatus('completed');

      setIsPaused(true);

      await persistLocalSnapshot({
        completedCount: nextCount,

        activeDurationSeconds: elapsedSecondsRef.current,

        status: 'completed',
      });

      await syncCompletionToServer();

      return;
    }

    await updateLocalPracticeSession(session._id, {
      completedCount: nextCount,

      activeDurationSeconds: elapsedSecondsRef.current,

      status: 'in_progress',
    });
  }, [
    hapticEnabled,
    isHydrated,
    isPaused,
    localStatus,
    persistLocalSnapshot,
    playTapTone,
    session._id,
    startOm,
    stopOm,
    syncCompletionToServer,
    target,
  ]);

  /*
   * Pause or resume the whole practice session.
   */
  const handlePauseToggle = useCallback(async () => {
    if (!isHydrated || isBusy || localStatus === 'completed') {
      return;
    }

    const nextPausedState = !pausedRef.current;

    pausedRef.current = nextPausedState;

    statusRef.current = nextPausedState ? 'paused' : 'in_progress';

    setIsPaused(nextPausedState);

    setLocalStatus(statusRef.current);

    if (nextPausedState) {
      pauseOm();
    } else {
      resumeOm();
    }

    await persistLocalSnapshot({
      status: statusRef.current,
    });

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await syncProgressToServer();
    }
  }, [
    isBusy,
    isHydrated,
    localStatus,
    pauseOm,
    persistLocalSnapshot,
    resumeOm,
    syncProgressToServer,
  ]);

  /*
   * Reset chant count and elapsed time.
   *
   * Om is not restarted from 0:00.
   */
  const handleReset = useCallback(async () => {
    if (!isHydrated || isBusy) {
      return;
    }

    const shouldReset = window.confirm('Reset this practice session to zero?');

    if (!shouldReset) {
      return;
    }

    countRef.current = 0;

    elapsedSecondsRef.current = 0;

    pausedRef.current = false;

    statusRef.current = 'in_progress';

    setCount(0);

    setElapsedSeconds(0);

    setIsPaused(false);

    setLocalStatus('in_progress');

    /*
     * If Om already started, resume from
     * its existing playback position.
     */
    resumeOm();

    await persistLocalSnapshot({
      completedCount: 0,

      activeDurationSeconds: 0,

      status: 'in_progress',
    });

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await syncProgressToServer();
    }
  }, [
    isBusy,
    isHydrated,
    persistLocalSnapshot,
    resumeOm,
    syncProgressToServer,
  ]);

  /*
   * Abandon the current practice.
   */
  const handleExit = useCallback(async () => {
    if (!isHydrated || isBusy) {
      return;
    }

    const shouldExit = window.confirm(
      'Exit this practice session? Your current progress will be saved as an unfinished session.'
    );

    if (!shouldExit) {
      return;
    }

    stopOm();

    cancelHaptic();

    statusRef.current = 'abandoned';

    pausedRef.current = true;

    setLocalStatus('abandoned');

    setIsPaused(true);

    await persistLocalSnapshot({
      status: 'abandoned',
    });

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await updatePracticeSession({
          sessionId: session._id,

          payload: {
            completedCount: countRef.current,

            activeDurationSeconds: elapsedSecondsRef.current,

            status: 'abandoned',
          },
        });

        await deleteLocalPracticeSession(session._id);
      } catch {
        setSyncMessage(
          'Your exit was saved on this device and will need to sync later.'
        );
      }
    }

    navigate(APP_ROUTES.practice);
  }, [
    isBusy,
    isHydrated,
    navigate,
    persistLocalSnapshot,
    session._id,
    stopOm,
    updatePracticeSession,
  ]);

  /*
   * Independent haptic switch.
   */
  const handleHapticToggle = useCallback(() => {
    setHapticEnabled((current) => {
      const nextValue = !current;

      if (!nextValue) {
        cancelHaptic();
      }

      return nextValue;
    });
  }, []);

  /*
   * Convert async handlers into stable synchronous
   * UI callbacks suitable for memoized components.
   */
  const handleChantClick = useCallback(() => {
    void handleChant();
  }, [handleChant]);

  const handlePauseClick = useCallback(() => {
    void handlePauseToggle();
  }, [handlePauseToggle]);

  const handleResetClick = useCallback(() => {
    void handleReset();
  }, [handleReset]);

  const handleExitClick = useCallback(() => {
    void handleExit();
  }, [handleExit]);

  return {
    /*
     * Runtime state.
     */
    count,
    elapsedSeconds,
    isPaused,
    hapticEnabled,
    isHydrated,
    localStatus,
    isOffline,
    syncMessage,

    /*
     * Derived metrics.
     */
    target,
    remaining: metrics.remaining,

    progress: metrics.progress,

    totalMalaRounds: metrics.totalMalaRounds,

    currentMalaRound: metrics.currentMalaRound,

    malaProgressCount: metrics.malaProgressCount,

    /*
     * Request state.
     */
    isBusy,
    isUpdatePending,
    isCompleteError,

    /*
     * Stable handlers.
     */
    handleChantClick,
    handlePauseClick,
    handleResetClick,
    handleExitClick,
    handleHapticToggle,
  };
}
