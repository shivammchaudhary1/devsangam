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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MANTRA_IMAGES } from '@/features/mantras/constants/mantra-images';
import { useMantra } from '@/features/mantras/hooks/useMantra';
import type { Mantra, PracticeSession } from '@devsangam/types';
import { useCallback } from 'react';
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

  const defaultSoundEnabled = auth.user?.preferences.soundEnabled ?? true;

  const defaultHapticEnabled = auth.user?.preferences.hapticEnabled ?? true;

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

  /*
   * Om may be toggled back on only when the
   * overall Sadhana is not paused.
   */
  const handleOmToggle = useCallback(() => {
    toggleOm(!isPaused);
  }, [isPaused, toggleOm]);

  const image = MANTRA_IMAGES[mantra.slug];

  if (!isHydrated) {
    return <PracticeSessionLoading />;
  }

  /*
   * Local completion can happen before the server
   * has successfully received the completion event.
   */
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
        <PracticeSessionHeader
          mantra={mantra}
          currentMalaRound={currentMalaRound}
          totalMalaRounds={totalMalaRounds}
          isOffline={isOffline}
          isBusy={isBusy}
          onExit={handleExitClick}
        />

        <PracticeMalaCounter
          count={count}
          target={target}
          progress={progress}
          isPaused={isPaused}
          isOffline={isOffline}
          onChant={handleChantClick}
        />

        <PracticeProgressSummary
          target={target}
          remaining={remaining}
          currentMalaRound={currentMalaRound}
          totalMalaRounds={totalMalaRounds}
          malaProgressCount={malaProgressCount}
          elapsedSeconds={elapsedSeconds}
          syncMessage={syncMessage}
        />

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
          onHapticToggle={handleHapticToggle}
          onPauseToggle={handlePauseClick}
          onReset={handleResetClick}
        />
      </div>
    </main>
  );
}
