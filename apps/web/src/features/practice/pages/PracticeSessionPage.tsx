import { AbandonedPracticeSession } from '../components/AbandonedPracticeSession';
import { CompletedPracticeSession } from '../components/CompletedPracticeSession';
import { PracticeAudioControls } from '../components/PracticeAudioControls';
import { PracticeMalaCounter } from '../components/PracticeMalaCounter';
import { PracticeProgressSummary } from '../components/PracticeProgressSummary';
import { PracticeSessionControls } from '../components/PracticeSessionControls';
import {
  PracticeSessionError,
  PracticeSessionLoading,
} from '../components/PracticeSessionFeedback';
import { PracticeSessionHeader } from '../components/PracticeSessionHeader';
import { usePracticeAudio } from '../hooks/usePracticeAudio';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { usePracticeSessionRuntime } from '../hooks/usePracticeSessionRuntime';
import {
  readPracticePreferences,
  writePracticePreferences,
} from '../storage/practice-preferences.storage';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MANTRA_IMAGES } from '@/features/mantras/constants/mantra-images';
import { useMantra } from '@/features/mantras/hooks/useMantra';
import type { Mantra, PracticeSession } from '@devsangam/types';
import { Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router';

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

  const preferenceUserId = auth.user?.id;

  const [storedPreferences] = useState(() =>
    readPracticePreferences(preferenceUserId)
  );

  const defaultSoundEnabled = auth.user?.preferences.soundEnabled ?? true;

  const defaultHapticEnabled =
    storedPreferences.hapticEnabled ??
    auth.user?.preferences.hapticEnabled ??
    true;

  const {
    omEnabled,
    omVolume,

    toneEnabled,
    toneVolume,

    startOm,
    pauseOm,
    resumeOm,
    stopOm,

    playTapTone,

    toggleOm,
    toggleTone,

    changeOmVolume,
    changeToneVolume,
  } = usePracticeAudio({
    defaultSoundEnabled,

    preferenceUserId,
  });

  const {
    count,
    elapsedSeconds,
    isPaused,
    hapticEnabled,
    isHydrated,
    localStatus,
    isOffline,
    syncMessage,

    target,
    remaining,
    progress,
    totalMalaRounds,
    currentMalaRound,
    malaProgressCount,

    isBusy,
    isUpdatePending,
    isCompleteError,

    handleChantClick,
    handlePauseClick,
    handleResetClick,
    handleExitClick,
    handleHapticToggle,
  } = usePracticeSessionRuntime({
    session,

    defaultHapticEnabled,

    startOm,
    pauseOm,
    resumeOm,
    stopOm,
    playTapTone,
  });

  const handleOmToggle = useCallback(() => {
    toggleOm(!isPaused);
  }, [isPaused, toggleOm]);

  const handlePersistentHapticToggle = useCallback(() => {
    const nextValue = !hapticEnabled;

    writePracticePreferences(preferenceUserId, {
      hapticEnabled: nextValue,
    });

    handleHapticToggle();
  }, [handleHapticToggle, hapticEnabled, preferenceUserId]);

  // const image = MANTRA_IMAGES[mantra.slug];
  const image = mantra.image || MANTRA_IMAGES[mantra.slug];

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
        isPendingSync={isOffline || isCompleteError}
      />
    );
  }

  if (localStatus === 'abandoned') {
    return <AbandonedPracticeSession />;
  }

  return (
    <main className="relative min-h-full overflow-hidden bg-[var(--ds-obsidian)] px-3 pb-28 pt-4 text-[var(--ds-cream)] sm:px-5 md:pb-8 lg:px-7 lg:py-5 xl:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[31%] size-[540px] -translate-x-1/2 rounded-full bg-[#d89a35]/[0.035] blur-[115px]" />

        <div className="absolute left-[8%] top-[9%] size-[260px] rounded-full bg-[#7b4a1f]/[0.025] blur-[95px]" />

        <div className="absolute right-[-190px] top-[16%] size-[430px] rounded-full border border-[#d89a35]/[0.028]" />

        <div className="absolute bottom-[-240px] left-[-120px] size-[440px] rounded-full border border-[var(--ds-border-soft)]" />

        {image ? (
          <>
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className="absolute -right-24 bottom-[-30px] hidden h-[460px] w-[330px] object-cover opacity-[0.035] blur-[1.5px] xl:block"
            />

            <div className="absolute -right-20 bottom-0 hidden h-[480px] w-[340px] bg-[linear-gradient(90deg,var(--ds-obsidian),transparent_38%,transparent)] xl:block" />
          </>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[820px]">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Sparkles size={11} strokeWidth={1.7} className="text-[var(--ds-gold)]" />

          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--ds-bronze)]">
            Digital Japamala
          </p>
        </div>

        <section className="relative overflow-hidden rounded-[14px] border border-[var(--ds-border-soft)] bg-[linear-gradient(145deg,rgba(255,255,255,0.018),transparent_32%),rgba(10,16,24,0.76)] px-3 pb-4 pt-3 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:px-4 sm:pb-5 sm:pt-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(216,154,53,0.24),transparent)]"
          />

          <PracticeSessionHeader
            mantra={mantra}
            currentMalaRound={currentMalaRound}
            totalMalaRounds={totalMalaRounds}
            isOffline={isOffline}
            isBusy={isBusy}
            onExit={handleExitClick}
          />

          <div className="mt-3 sm:mt-4">
            <PracticeMalaCounter
              count={count}
              target={target}
              progress={progress}
              isPaused={isPaused}
              isOffline={isOffline}
              onChant={handleChantClick}
            />
          </div>

          <div className="mt-3 sm:mt-4">
            <PracticeProgressSummary
              target={target}
              remaining={remaining}
              currentMalaRound={currentMalaRound}
              totalMalaRounds={totalMalaRounds}
              malaProgressCount={malaProgressCount}
              elapsedSeconds={elapsedSeconds}
              syncMessage={syncMessage}
            />
          </div>

          <div className="my-4 h-px bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.10)_18%,rgba(216,154,53,0.12)_50%,rgba(148,163,184,0.10)_82%,transparent)]" />

          <div className="grid gap-3 lg:grid-cols-2">
            <PracticeAudioControls
              omEnabled={omEnabled}
              omVolume={omVolume}
              toneEnabled={toneEnabled}
              toneVolume={toneVolume}
              onOmToggle={handleOmToggle}
              onToneToggle={toggleTone}
              onOmVolumeChange={changeOmVolume}
              onToneVolumeChange={changeToneVolume}
            />

            <PracticeSessionControls
              hapticEnabled={hapticEnabled}
              isPaused={isPaused}
              isBusy={isBusy}
              isUpdating={isUpdatePending}
              onHapticToggle={handlePersistentHapticToggle}
              onPauseToggle={handlePauseClick}
              onReset={handleResetClick}
            />
          </div>
        </section>

        <div className="mt-3 flex items-center justify-center gap-3 px-4 text-center">
          <div className="h-px w-10 bg-[linear-gradient(90deg,transparent,rgba(216,154,53,0.2))]" />

          <p className="font-serif text-[8px] tracking-[0.04em] text-[var(--ds-bronze)]">
            One chant. One breath. One point of focus.
          </p>

          <div className="h-px w-10 bg-[linear-gradient(90deg,rgba(216,154,53,0.2),transparent)]" />
        </div>
      </div>
    </main>
  );
}
