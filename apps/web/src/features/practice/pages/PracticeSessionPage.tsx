import { PRACTICE_AUDIO } from '../constants/practice-audio.constants';
import { useCompletePracticeSession } from '../hooks/useCompletePracticeSession';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { useUpdatePracticeSession } from '../hooks/useUpdatePracticeSession';
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
import { APP_ROUTES } from '@/app/constants/routes.constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MANTRA_IMAGES } from '@/features/mantras/constants/mantra-images';
import { useMantra } from '@/features/mantras/hooks/useMantra';
import type { Mantra, PracticeSession } from '@devsangam/types';
import {
  ArrowLeft,
  Clock3,
  Loader2,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router';

const MALA_SIZE = 108;

const BEAD_COUNT = 36;

const SERVER_SYNC_INTERVAL_MS = 15_000;

const DEFAULT_OM_VOLUME = 0.35;

const DEFAULT_TONE_VOLUME = 0.6;

export function PracticeSessionPage() {
  const { mantraSlug, sessionId } = useParams<{
    mantraSlug: string;
    sessionId: string;
  }>();

  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
    error: sessionError,
  } = usePracticeSession(sessionId);

  const {
    data: mantra,
    isLoading: isMantraLoading,
    isError: isMantraError,
  } = useMantra(mantraSlug);

  if (isSessionLoading || isMantraLoading) {
    return <PracticeSessionLoading />;
  }

  if (
    isSessionError ||
    isMantraError ||
    !session ||
    !mantra ||
    session.mantraSlug !== mantra.slug
  ) {
    return (
      <PracticeSessionError
        message={
          sessionError instanceof Error
            ? sessionError.message
            : 'This practice session could not be loaded.'
        }
      />
    );
  }

  if (session.status === 'completed') {
    return <CompletedPracticeSession session={session} mantra={mantra} />;
  }

  if (session.status === 'abandoned') {
    return <AbandonedPracticeSession />;
  }

  return (
    <ActivePracticeSession
      key={session._id}
      session={session}
      mantra={mantra}
    />
  );
}

type ActivePracticeSessionProps = {
  session: PracticeSession;
  mantra: Mantra;
};

function ActivePracticeSession({
  session,
  mantra,
}: ActivePracticeSessionProps) {
  const auth = useAuth();

  const navigate = useNavigate();

  const updateSession = useUpdatePracticeSession();

  const completeSession = useCompletePracticeSession();

  const defaultSoundEnabled = auth.user?.preferences.soundEnabled ?? true;

  const [count, setCount] = useState(session.completedCount);

  const [elapsedSeconds, setElapsedSeconds] = useState(
    session.activeDurationSeconds
  );

  const [isPaused, setIsPaused] = useState(session.status === 'paused');

  /*
   * Om background audio controls.
   */
  const [omEnabled, setOmEnabled] = useState(() => defaultSoundEnabled);

  const [omVolume, setOmVolume] = useState(DEFAULT_OM_VOLUME);

  /*
   * Per-tap confirmation tone controls.
   */
  const [toneEnabled, setToneEnabled] = useState(() => defaultSoundEnabled);

  const [toneVolume, setToneVolume] = useState(DEFAULT_TONE_VOLUME);

  /*
   * Haptic control.
   */
  const [hapticEnabled, setHapticEnabled] = useState(
    () => auth.user?.preferences.hapticEnabled ?? true
  );

  const [isHydrated, setIsHydrated] = useState(false);

  const [localStatus, setLocalStatus] = useState<LocalPracticeSessionStatus>(
    session.status
  );

  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const countRef = useRef(session.completedCount);

  const elapsedSecondsRef = useRef(session.activeDurationSeconds);

  const pausedRef = useRef(session.status === 'paused');

  const statusRef = useRef<LocalPracticeSessionStatus>(session.status);

  /*
   * One long-running HTML Audio instance
   * for the Om background recording.
   */
  const omAudioRef = useRef<HTMLAudioElement | null>(null);

  /*
   * True after the Om recording has been
   * successfully started at least once.
   */
  const omStartedRef = useRef(false);

  /*
   * One reusable Web Audio context for
   * all short tap confirmation tones.
   */
  const tapAudioContextRef = useRef<AudioContext | null>(null);

  const completionSyncInProgressRef = useRef(false);

  const target = session.targetCount;

  const remaining = Math.max(target - count, 0);

  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;

  const totalMalaRounds = Math.max(1, Math.ceil(target / MALA_SIZE));

  const currentMalaRound =
    count >= target
      ? totalMalaRounds
      : Math.min(Math.floor(count / MALA_SIZE) + 1, totalMalaRounds);

  const malaProgressCount =
    count >= target ? target % MALA_SIZE || MALA_SIZE : count % MALA_SIZE;

  const image = MANTRA_IMAGES[mantra.slug];

  const isBusy = updateSession.isPending || completeSession.isPending;

  const persistLocalSnapshot = useCallback(
    async (changes: Partial<LocalPracticeSession> = {}) => {
      const existing = await getLocalPracticeSession(session._id);

      const now = new Date().toISOString();

      const snapshot: LocalPracticeSession = {
        sessionId: session._id,
        mantraSlug: session.mantraSlug,
        targetCount: session.targetCount,
        completedCount: countRef.current,
        activeDurationSeconds: elapsedSecondsRef.current,
        status: statusRef.current,
        startedAt: session.startedAt,
        updatedAt: now,
        lastSyncedAt: existing?.lastSyncedAt ?? null,
        ...changes,
      };

      await saveLocalPracticeSession(snapshot);
    },
    [session._id, session.mantraSlug, session.startedAt, session.targetCount]
  );

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
      await updateSession.mutateAsync({
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
  }, [session._id, updateSession]);

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
      await completeSession.mutateAsync({
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
  }, [completeSession, session._id, target]);

  /*
   * Long Om background audio.
   *
   * This NEVER resets on normal chant taps.
   */
  const startOrResumeOm = useCallback(() => {
    if (!omEnabled) {
      return;
    }

    if (pausedRef.current) {
      return;
    }

    if (
      statusRef.current === 'completed' ||
      statusRef.current === 'abandoned'
    ) {
      return;
    }

    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = omVolume;

    void audio
      .play()
      .then(() => {
        omStartedRef.current = true;
      })
      .catch(() => {
        omStartedRef.current = false;
      });
  }, [omEnabled, omVolume]);

  /*
   * Pause Om but preserve playback position.
   */
  const pauseOm = useCallback(() => {
    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
  }, []);

  /*
   * Stop Om completely and reset to 0:00.
   */
  const stopOm = useCallback(() => {
    const audio = omAudioRef.current;

    if (audio) {
      audio.pause();

      audio.currentTime = 0;
    }

    omStartedRef.current = false;
  }, []);

  /*
   * Short tap confirmation tone.
   *
   * Completely independent from Om audio.
   */
  const playTapTone = useCallback(() => {
    if (!toneEnabled) {
      return;
    }

    if (toneVolume <= 0) {
      return;
    }

    try {
      let audioContext = tapAudioContextRef.current;

      if (!audioContext) {
        audioContext = new AudioContext();

        tapAudioContextRef.current = audioContext;
      }

      const createTone = () => {
        if (!audioContext) {
          return;
        }

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        /*
         * High enough to remain audible
         * over the Om recording.
         */
        oscillator.type = 'sine';

        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

        /*
         * Keep maximum tap tone output
         * comfortable while still providing
         * a full 0–100 UI control.
         */
        const gainLevel = Math.max(0.001, toneVolume * 0.2);

        gain.gain.setValueAtTime(gainLevel, audioContext.currentTime);

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.075
        );

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 0.075);
      };

      if (audioContext.state === 'suspended') {
        void audioContext
          .resume()
          .then(createTone)
          .catch(() => {
            // Tap sound is optional.
          });

        return;
      }

      createTone();
    } catch {
      // Tap sound is optional.
    }
  }, [toneEnabled, toneVolume]);

  /*
   * Restore local practice state.
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
   * Browser connectivity.
   */
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);

      if (statusRef.current === 'completed') {
        void syncCompletionToServer();
      } else {
        void syncProgressToServer();
      }
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
   * Periodic server synchronization.
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
   * Save local snapshot when tab is hidden.
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
   * Initialize exactly ONE Om audio element.
   */
  useEffect(() => {
    const audio = new Audio(PRACTICE_AUDIO.om);

    audio.preload = 'auto';

    /*
     * If practice exceeds the duration
     * of your 15-minute recording,
     * automatically loop it.
     */
    audio.loop = true;

    audio.volume = DEFAULT_OM_VOLUME;

    omAudioRef.current = audio;

    return () => {
      audio.pause();

      audio.currentTime = 0;

      omAudioRef.current = null;

      omStartedRef.current = false;

      const tapAudioContext = tapAudioContextRef.current;

      if (tapAudioContext) {
        void tapAudioContext.close();

        tapAudioContextRef.current = null;
      }

      cancelHaptic();
    };
  }, []);

  /*
   * Apply Om slider changes immediately
   * while audio is already playing.
   */
  useEffect(() => {
    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = omVolume;
  }, [omVolume]);

  async function handleChant() {
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
     * Start Om only once.
     *
     * Later chant taps do not restart it.
     */
    if (omEnabled && !omStartedRef.current) {
      startOrResumeOm();
    }

    /*
     * Independent tap sound.
     */
    playTapTone();

    /*
     * Independent haptic feedback.
     */
    if (hapticEnabled) {
      triggerChantHaptic();
    }

    if (nextCount === target) {
      /*
       * Completion permanently stops the
       * Om recording and resets it to 0:00.
       */
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
  }

  async function handlePauseToggle() {
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
    } else if (omEnabled && omStartedRef.current) {
      startOrResumeOm();
    }

    await persistLocalSnapshot({
      status: statusRef.current,
    });

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await syncProgressToServer();
    }
  }

  async function handleReset() {
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
     * Reset does not restart the Om.
     *
     * If it was already playing, it simply
     * continues from its current position.
     *
     * If reset happened while paused,
     * resume it because the reset returns
     * the session to in_progress.
     */
    if (omEnabled && omStartedRef.current) {
      startOrResumeOm();
    }

    await persistLocalSnapshot({
      completedCount: 0,
      activeDurationSeconds: 0,
      status: 'in_progress',
    });

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await syncProgressToServer();
    }
  }

  async function handleExit() {
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
        await updateSession.mutateAsync({
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
  }

  function handleOmToggle() {
    const nextValue = !omEnabled;

    setOmEnabled(nextValue);

    /*
     * OFF:
     * pause but preserve audio position.
     */
    if (!nextValue) {
      pauseOm();

      return;
    }

    /*
     * ON:
     * resume only if the Om has already
     * been started earlier.
     *
     * Otherwise first chant starts it.
     */
    if (omStartedRef.current && !pausedRef.current) {
      const audio = omAudioRef.current;

      if (audio) {
        audio.volume = omVolume;

        void audio.play().catch(() => {
          // Om sound is optional.
        });
      }
    }
  }

  function handleToneToggle() {
    setToneEnabled((current) => !current);
  }

  function handleHapticToggle() {
    const nextValue = !hapticEnabled;

    setHapticEnabled(nextValue);

    if (!nextValue) {
      cancelHaptic();
    }
  }

  function handleOmVolumeChange(value: number) {
    const normalizedVolume = Math.min(Math.max(value, 0), 100) / 100;

    setOmVolume(normalizedVolume);
  }

  function handleToneVolumeChange(value: number) {
    const normalizedVolume = Math.min(Math.max(value, 0), 100) / 100;

    setToneVolume(normalizedVolume);
  }

  if (!isHydrated) {
    return <PracticeSessionLoading />;
  }

  if (localStatus === 'completed') {
    const localCompletedSession: PracticeSession = {
      ...session,
      completedCount: target,
      activeDurationSeconds: elapsedSeconds,
      status: 'completed',
      completedAt: session.completedAt ?? new Date().toISOString(),
    };

    return (
      <CompletedPracticeSession
        session={localCompletedSession}
        mantra={mantra}
        isPendingSync={isOffline || completeSession.isError}
      />
    );
  }

  if (localStatus === 'abandoned') {
    return <AbandonedPracticeSession />;
  }

  return (
    <main className="relative min-h-full overflow-hidden bg-[#07111f] px-3 pb-28 pt-4 text-white sm:px-5 md:pb-8 lg:px-8 lg:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[32%] size-[520px] -translate-x-1/2 rounded-full bg-amber-400/[0.025] blur-[100px]" />

        <div className="absolute right-[-180px] top-[18%] size-[420px] rounded-full border border-amber-400/[0.04]" />

        {image ? (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute -right-20 bottom-0 hidden h-[420px] w-[300px] object-cover opacity-[0.04] blur-[1px] xl:block"
          />
        ) : null}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[780px]">
        <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0a1320]/80 px-3 backdrop-blur-md sm:px-4">
          <button
            type="button"
            onClick={() => {
              void handleExit();
            }}
            disabled={isBusy}
            className="inline-flex items-center gap-2 text-[11px] text-slate-400 transition hover:text-amber-300 disabled:opacity-40"
          >
            <ArrowLeft size={14} />

            <span>Exit Session</span>
          </button>

          <div className="flex items-center gap-3">
            <span
              className={[
                'size-1.5 rounded-full',
                isOffline ? 'bg-orange-400' : 'bg-emerald-400',
              ].join(' ')}
            />

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.13em] text-slate-500">
              <span>
                Mala {currentMalaRound} / {totalMalaRounds}
              </span>

              <Sparkles size={12} className="text-amber-400" />
            </div>
          </div>
        </div>

        <header className="mx-auto mt-5 max-w-xl text-center sm:mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/85">
            {mantra.deity ?? 'Daily Sadhana'}
          </p>

          <h1 className="mt-2 font-serif text-xl font-medium uppercase tracking-[0.08em] text-[#e7c76e] sm:text-2xl">
            {mantra.title}
          </h1>

          <p className="mt-2 font-serif text-sm leading-6 text-amber-50/80 sm:text-base">
            {mantra.sanskrit}
          </p>
        </header>

        <section className="mt-5 flex flex-col items-center sm:mt-6">
          <button
            type="button"
            onClick={() => {
              void handleChant();
            }}
            disabled={isPaused}
            aria-label={
              isPaused ? 'Practice is paused' : 'Tap to count one chant'
            }
            className="group relative flex size-[270px] touch-manipulation items-center justify-center rounded-full outline-none transition active:scale-[0.985] disabled:cursor-default sm:size-[330px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-[8%] rounded-full bg-amber-400/[0.05] blur-2xl transition group-active:bg-amber-400/[0.09]"
            />

            <div
              aria-hidden="true"
              className="absolute inset-[3%] rounded-full border border-amber-300/15 shadow-[0_0_50px_rgba(245,158,11,0.08)]"
            />

            <div
              aria-hidden="true"
              className="absolute inset-[8%] rounded-full border border-amber-400/30 shadow-[inset_0_0_26px_rgba(245,158,11,0.07),0_0_24px_rgba(245,158,11,0.08)]"
            />

            <div aria-hidden="true" className="absolute inset-0">
              {Array.from({
                length: BEAD_COUNT,
              }).map((_, index) => {
                const angle = (360 / BEAD_COUNT) * index;

                const illuminatedBeads = Math.round(
                  (progress / 100) * BEAD_COUNT
                );

                const isLit = index < illuminatedBeads;

                return (
                  <span
                    key={index}
                    className={[
                      'absolute left-1/2 top-1/2 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border sm:size-[11px]',
                      isLit
                        ? 'border-[#f9d67d] bg-[#dca53d] shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                        : 'border-amber-300/30 bg-[#5d431f]',
                    ].join(' ')}
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-123px)`,
                    }}
                  />
                );
              })}
            </div>

            <svg
              aria-hidden="true"
              className="absolute inset-[12%] -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1.5"
              />

              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(231,183,73,0.8)"
                strokeWidth="1.6"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - progress}
                className="transition-[stroke-dashoffset] duration-200"
              />
            </svg>

            <div className="relative flex size-[62%] flex-col items-center justify-center rounded-full border border-amber-300/15 bg-[radial-gradient(circle_at_center,#152033_0%,#0b1421_62%,#07101a_100%)] shadow-[inset_0_0_45px_rgba(0,0,0,0.55)]">
              {isPaused ? (
                <>
                  <Pause size={34} className="text-[#e1b857]" />

                  <span className="mt-3 text-[10px] uppercase tracking-[0.18em] text-amber-200/60">
                    Paused
                  </span>
                </>
              ) : (
                <>
                  <span className="font-serif text-5xl font-medium tracking-[0.03em] text-[#f0ca6c] sm:text-6xl">
                    {String(count).padStart(3, '0')}
                  </span>

                  <span className="mt-1 text-sm text-slate-500">
                    / {target}
                  </span>

                  <span className="mt-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-amber-200/60">
                    Tap to chant
                  </span>

                  <span className="mt-2 font-serif text-xl text-[#dba843]">
                    ॐ
                  </span>
                </>
              )}
            </div>
          </button>

          <p className="mt-3 text-center text-[10px] text-slate-600">
            {isPaused
              ? 'Resume when you are ready.'
              : isOffline
                ? 'Offline mode — your chants are saved on this device.'
                : 'Each tap counts one repetition.'}
          </p>
        </section>

        <section className="mx-auto mt-5 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
          <PracticeStat label="Target" value={target.toString()} />

          <PracticeStat label="Remaining" value={remaining.toString()} />

          <PracticeStat
            label="Mala"
            value={`${currentMalaRound} / ${totalMalaRounds}`}
          />
        </section>

        <section className="mx-auto mt-3 max-w-xl rounded-xl border border-white/[0.07] bg-[#09121e] px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
                Current mala progress
              </p>

              <p className="mt-1 text-xs text-slate-300">
                {malaProgressCount} / {MALA_SIZE}
              </p>
            </div>

            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#b87a20] to-[#f0c45c] transition-[width] duration-200"
                style={{
                  width: `${Math.min(
                    (malaProgressCount / MALA_SIZE) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-3 flex max-w-[200px] items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-[#09121e] px-4 py-2.5">
          <Clock3 size={14} className="text-amber-400/70" />

          <div className="text-center">
            <p className="text-[8px] uppercase tracking-[0.15em] text-slate-600">
              Elapsed Time
            </p>

            <p className="mt-0.5 font-mono text-sm text-slate-200">
              {formatDuration(elapsedSeconds)}
            </p>
          </div>
        </section>

        {syncMessage ? (
          <div className="mx-auto mt-3 max-w-xl rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-center text-[10px] leading-5 text-amber-100/60">
            {syncMessage}
          </div>
        ) : null}

        <section className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/[0.08] bg-[#09121e] p-3 sm:p-4">
          <div className="mb-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-400/75">
              Audio
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Control background Om and chant confirmation tone independently.
            </p>
          </div>

          <div className="space-y-3">
            <AudioControlRow
              label="Om Background"
              description="Continuous devotional audio"
              enabled={omEnabled}
              volume={omVolume}
              icon={omEnabled ? <Music2 size={16} /> : <VolumeX size={16} />}
              onToggle={handleOmToggle}
              onVolumeChange={handleOmVolumeChange}
            />

            <AudioControlRow
              label="Tap Tone"
              description="Short sound on each chant"
              enabled={toneEnabled}
              volume={toneVolume}
              icon={toneEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              onToggle={handleToneToggle}
              onVolumeChange={handleToneVolumeChange}
            />
          </div>
        </section>

        <section className="mx-auto mt-3 grid max-w-xl grid-cols-3 gap-2">
          <ControlButton
            label="Haptic"
            value={hapticEnabled ? 'On' : 'Off'}
            onClick={handleHapticToggle}
            icon={<Waves size={16} />}
          />

          <button
            type="button"
            onClick={() => {
              void handlePauseToggle();
            }}
            disabled={isBusy}
            className="flex min-h-[58px] flex-col items-center justify-center rounded-xl border border-amber-300/55 bg-gradient-to-b from-[#efbd54] to-[#c88624] px-2 text-[#261804] shadow-[0_0_20px_rgba(245,158,11,0.1)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {updateSession.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPaused ? (
              <Play size={16} fill="currentColor" />
            ) : (
              <Pause size={16} fill="currentColor" />
            )}

            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em]">
              {isPaused ? 'Resume' : 'Pause'}
            </span>
          </button>

          <ControlButton
            label="Reset"
            value="Session"
            onClick={() => {
              void handleReset();
            }}
            disabled={isBusy}
            icon={<RotateCcw size={16} />}
          />
        </section>
      </div>
    </main>
  );
}

type AudioControlRowProps = {
  label: string;
  description: string;
  enabled: boolean;
  volume: number;
  icon: ReactNode;
  onToggle: () => void;
  onVolumeChange: (value: number) => void;
};

function AudioControlRow({
  label,
  description,
  enabled,
  volume,
  icon,
  onToggle,
  onVolumeChange,
}: AudioControlRowProps) {
  const volumePercentage = Math.round(volume * 100);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#07101a] p-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          className={[
            'flex size-10 shrink-0 items-center justify-center rounded-xl border transition',
            enabled
              ? 'border-amber-400/35 bg-amber-400/[0.10] text-amber-300'
              : 'border-white/[0.08] bg-white/[0.025] text-slate-600',
          ].join(' ')}
        >
          {icon}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200">{label}</p>

              <p className="mt-0.5 truncate text-[9px] text-slate-600">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className={[
                'shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] transition',
                enabled
                  ? 'border-amber-400/30 bg-amber-400/[0.08] text-amber-300'
                  : 'border-white/[0.08] bg-white/[0.025] text-slate-600',
              ].join(' ')}
            >
              {enabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <VolumeX size={12} className="shrink-0 text-slate-600" />

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volumePercentage}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              disabled={!enabled}
              aria-label={`${label} volume`}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-amber-400 disabled:cursor-not-allowed disabled:opacity-35"
            />

            <Volume2 size={13} className="shrink-0 text-amber-400/60" />

            <span className="w-8 shrink-0 text-right font-mono text-[9px] text-slate-500">
              {volumePercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type PracticeStatProps = {
  label: string;
  value: string;
};

function PracticeStat({ label, value }: PracticeStatProps) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#09121e] px-2 py-3 text-center">
      <p className="text-[8px] uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 font-serif text-base text-[#e8c86f] sm:text-lg">
        {value}
      </p>
    </div>
  );
}

type ControlButtonProps = {
  label: string;
  value: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

function ControlButton({
  label,
  value,
  icon,
  onClick,
  disabled = false,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[58px] flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#09121e] px-2 text-slate-400 transition hover:border-amber-400/20 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}

      <span className="mt-1 text-[9px] uppercase tracking-[0.08em]">
        {label}
      </span>

      <span className="text-[8px] text-slate-600">{value}</span>
    </button>
  );
}

type CompletedPracticeSessionProps = {
  session: PracticeSession;
  mantra: Mantra;
  isPendingSync?: boolean;
};

function CompletedPracticeSession({
  session,
  mantra,
  isPendingSync = false,
}: CompletedPracticeSessionProps) {
  const navigate = useNavigate();

  const malaCount = session.targetCount / MALA_SIZE;

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#07111f] px-4 pb-28 pt-8 text-white md:pb-8">
      <section className="w-full max-w-lg rounded-3xl border border-amber-400/20 bg-[#0b1421] p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/[0.08]">
          <Sparkles className="text-[#e7bd58]" />
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400">
          Sadhana Complete
        </p>

        <h1 className="mt-2 font-serif text-2xl text-[#f0dfad]">
          {mantra.title}
        </h1>

        <p className="mt-3 font-serif text-sm leading-6 text-amber-50/70">
          {mantra.sanskrit}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <PracticeStat label="Chants" value={`${session.completedCount}`} />

          <PracticeStat
            label="Malas"
            value={
              Number.isInteger(malaCount)
                ? malaCount.toString()
                : malaCount.toFixed(1)
            }
          />

          <PracticeStat
            label="Time"
            value={formatShortDuration(session.activeDurationSeconds)}
          />
        </div>

        {isPendingSync ? (
          <p className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-[10px] leading-5 text-amber-100/60">
            Completed on this device. Server sync will finish when you are
            online.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.practice)}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-amber-300/70 bg-gradient-to-b from-[#f3c45d] to-[#d89627] text-sm font-semibold text-[#241704] transition hover:brightness-105"
        >
          Practice Again
        </button>

        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.home)}
          className="mt-2 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] text-xs text-slate-400 transition hover:border-white/[0.14] hover:text-white"
        >
          Return Home
        </button>
      </section>
    </main>
  );
}

function AbandonedPracticeSession() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#07111f] px-4 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0b1421] p-6 text-center">
        <h1 className="font-serif text-xl text-[#f0dfad]">Session ended</h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This practice session has already been exited.
        </p>

        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.practice)}
          className="mt-5 h-10 w-full rounded-xl border border-amber-300/60 bg-gradient-to-b from-[#f3c45d] to-[#d89627] text-sm font-semibold text-[#241704]"
        >
          Start New Practice
        </button>
      </section>
    </main>
  );
}

function PracticeSessionLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#07111f]">
      <Loader2 className="size-7 animate-spin text-amber-400" />
    </div>
  );
}

function PracticeSessionError({ message }: { message: string }) {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#07111f] px-4 text-white">
      <section className="w-full max-w-md rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6 text-center">
        <h1 className="font-serif text-xl text-red-100">
          Unable to load practice
        </h1>

        <p className="mt-2 text-sm leading-6 text-red-100/60">{message}</p>

        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.practice)}
          className="mt-5 h-10 w-full rounded-xl border border-white/[0.09] bg-white/[0.03] text-sm text-slate-200"
        >
          Return to Practice
        </button>
      </section>
    </main>
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function formatShortDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
