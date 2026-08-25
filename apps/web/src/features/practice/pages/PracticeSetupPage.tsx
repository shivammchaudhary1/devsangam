import {
  MAX_CUSTOM_PRACTICE_TARGET,
  MIN_CUSTOM_PRACTICE_TARGET,
  PRACTICE_TARGET_OPTIONS,
} from '../constants/practice.constants';
import { useCreatePracticeSession } from '../hooks/useCreatePracticeSession';
import { useLocalPracticeSessions } from '../hooks/useLocalPracticeSessions';
import { usePracticeSessions } from '../hooks/usePracticeSessions';
import { getPracticeEstimatedMinutes } from '../utils/practice.utils';
import { getResumablePracticeSession } from '../utils/resumable-practice.utils';
import { getPracticeSessionRoute } from '@/app/constants/routes.constants';
import { MANTRA_IMAGES } from '@/features/mantras/constants/mantra-images';
import { useMantras } from '@/features/mantras/hooks/useMantras';
import {
  ArrowRight,
  Check,
  Circle,
  Clock3,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

export function PracticeSetupPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const mantraFromQuery = searchParams.get('mantra');

  const { data: mantras = [], isLoading, isError } = useMantras();

  const { data: serverSessions = [] } = usePracticeSessions();

  const { data: localSessions = [] } = useLocalPracticeSessions();

  const createSession = useCreatePracticeSession();

  const [selectedMantraSlug, setSelectedMantraSlug] = useState<string | null>(
    null
  );

  const [selectedTarget, setSelectedTarget] = useState<number>(108);

  const [isCustomTarget, setIsCustomTarget] = useState(false);

  const [customTarget, setCustomTarget] = useState('');

  const resolvedSelectedMantraSlug = useMemo(() => {
    if (
      selectedMantraSlug &&
      mantras.some((mantra) => mantra.slug === selectedMantraSlug)
    ) {
      return selectedMantraSlug;
    }

    if (
      mantraFromQuery &&
      mantras.some((mantra) => mantra.slug === mantraFromQuery)
    ) {
      return mantraFromQuery;
    }

    return mantras[0]?.slug ?? '';
  }, [mantras, mantraFromQuery, selectedMantraSlug]);

  const selectedMantra = useMemo(
    () =>
      mantras.find((mantra) => mantra.slug === resolvedSelectedMantraSlug) ??
      null,
    [mantras, resolvedSelectedMantraSlug]
  );

  const resumableSession = useMemo(
    () => getResumablePracticeSession(serverSessions, localSessions),
    [serverSessions, localSessions]
  );

  const resumableMantra = useMemo(
    () =>
      resumableSession
        ? (mantras.find(
            (mantra) => mantra.slug === resumableSession.mantraSlug
          ) ?? null)
        : null,
    [mantras, resumableSession]
  );

  const customTargetNumber = Number(customTarget);

  const isValidCustomTarget =
    Number.isInteger(customTargetNumber) &&
    customTargetNumber >= MIN_CUSTOM_PRACTICE_TARGET &&
    customTargetNumber <= MAX_CUSTOM_PRACTICE_TARGET;

  const targetCount = isCustomTarget ? customTargetNumber : selectedTarget;

  const estimatedMinutes = getPracticeEstimatedMinutes(
    targetCount,
    selectedMantra?.estimatedSecondsPerChant ?? null
  );

  function handlePresetTarget(target: number) {
    setIsCustomTarget(false);

    setSelectedTarget(target);
  }

  function handleCustomTarget() {
    setIsCustomTarget(true);

    if (!customTarget) {
      setCustomTarget('108');
    }
  }

  function handleResumePractice() {
    if (!resumableSession) {
      return;
    }

    navigate(
      getPracticeSessionRoute(
        resumableSession.mantraSlug,
        resumableSession.sessionId
      )
    );
  }

  async function handleStartPractice() {
    if (!selectedMantra) {
      return;
    }

    if (isCustomTarget && !isValidCustomTarget) {
      return;
    }

    try {
      const session = await createSession.mutateAsync({
        mantraSlug: selectedMantra.slug,
        targetCount,
      });

      navigate(getPracticeSessionRoute(session.mantraSlug, session._id));
    } catch {
      // Error state is rendered below.
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-[#d89a35]" />
      </div>
    );
  }

  if (isError || !mantras.length) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-[12px] border border-red-400/20 bg-red-400/[0.035] p-6 text-center">
          <h1 className="font-serif text-xl text-red-100">
            Practice unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-100/60">
            We could not load the mantra library. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-full overflow-hidden bg-[var(--ds-obsidian)] px-3 pb-28 pt-5 text-[var(--ds-cream)] sm:px-5 md:pb-10 lg:px-7 lg:py-6 xl:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[24%] top-[-220px] size-[480px] rounded-full bg-[#d89a35]/[0.025] blur-[120px]" />

        <div className="absolute bottom-[-220px] right-[-140px] size-[420px] rounded-full border border-[#d89a35]/[0.025]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[940px]">
        <header className="mb-5 border-b border-white/[0.065] pb-5 lg:mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={12} strokeWidth={1.7} className="text-[#d89a35]" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#c58a32]">
              Start Practice
            </span>
          </div>

          <h1 className="mt-2 font-serif text-[25px] font-medium tracking-[0.015em] text-[#eee5d8] sm:text-[29px]">
            Begin Your Sadhana
          </h1>

          <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-[#737b86] sm:text-xs">
            Choose a mantra, set your intention, and enter your chanting
            practice.
          </p>
        </header>

        {resumableSession ? (
          <section className="relative mb-4 overflow-hidden rounded-[12px] border border-[#d89a35]/25 bg-[linear-gradient(135deg,rgba(216,154,53,0.085),rgba(13,19,28,0.98)_38%,#0a1018)] shadow-[0_14px_34px_rgba(0,0,0,0.22),0_0_26px_rgba(216,154,53,0.04)]">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-[10px] border border-[#d89a35]/18 bg-[#080d14]">
                  {resumableMantra && MANTRA_IMAGES[resumableMantra.slug] ? (
                    <img
                      src={MANTRA_IMAGES[resumableMantra.slug]}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <RotateCcw className="size-5 text-[#d89a35]/70" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {resumableSession.status === 'paused' ? (
                      <Pause className="size-3.5 text-[#d89a35]" />
                    ) : (
                      <Play className="size-3.5 text-[#d89a35]" />
                    )}

                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#c88b32]">
                      Continue Sadhana
                    </p>
                  </div>

                  <h2 className="mt-1 truncate font-serif text-sm font-medium text-[#e7d7b7] sm:text-[15px]">
                    {resumableMantra?.title ?? resumableSession.mantraSlug}
                  </h2>

                  <p className="mt-1 text-[10px] text-[#68717c]">
                    Your unfinished practice is ready to continue.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:w-[230px]">
                <ResumeStat
                  label="Progress"
                  value={`${resumableSession.completedCount}/${resumableSession.targetCount}`}
                />

                <ResumeStat
                  label="Remaining"
                  value={`${Math.max(
                    resumableSession.targetCount -
                      resumableSession.completedCount,
                    0
                  )}`}
                />

                <ResumeStat
                  label="Status"
                  value={
                    resumableSession.status === 'paused' ? 'Paused' : 'Active'
                  }
                />
              </div>

              <button
                type="button"
                onClick={handleResumePractice}
                className="ds-gold-button inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] px-4 text-[10px] font-semibold"
              >
                <Play size={14} fill="currentColor" />
                Resume
              </button>
            </div>
          </section>
        ) : null}

        <section className="relative overflow-hidden rounded-[13px] border border-white/[0.075] bg-[linear-gradient(145deg,rgba(255,255,255,0.022),transparent_34%),#0d131c] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-4 lg:p-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full border border-[#d89a35]/25 bg-[#d89a35]/[0.065] text-[9px] font-semibold text-[#e2ac4c] shadow-[0_0_16px_rgba(216,154,53,0.035)]">
                1
              </div>

              <div>
                <h2 className="font-serif text-sm font-medium text-[#ddd4c7] sm:text-[15px]">
                  Choose Your Mantra
                </h2>

                <p className="mt-0.5 text-[9px] text-[#626b76]">
                  Select a mantra to begin your practice
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              {mantras.map((mantra) => {
                const isSelected = mantra.slug === resolvedSelectedMantraSlug;

                const image = MANTRA_IMAGES[mantra.slug];

                return (
                  <button
                    key={mantra._id}
                    type="button"
                    onClick={() => setSelectedMantraSlug(mantra.slug)}
                    aria-pressed={isSelected}
                    className={[
                      'group w-full min-w-0 overflow-hidden rounded-[10px] border text-left transition-all duration-200',
                      isSelected
                        ? [
                            'border-[#d89a35]/55',
                            'bg-[linear-gradient(90deg,rgba(216,154,53,0.095),rgba(216,154,53,0.038)_62%,transparent)]',
                            'shadow-[0_0_22px_rgba(216,154,53,0.055),inset_0_1px_0_rgba(255,255,255,0.025)]',
                          ].join(' ')
                        : [
                            'border-white/[0.065]',
                            'bg-white/[0.016]',
                            'hover:border-white/[0.11]',
                            'hover:bg-white/[0.026]',
                          ].join(' '),
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 items-center gap-2.5 p-2.5 min-[400px]:gap-3 sm:p-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-[8px] border border-white/[0.075] bg-[#080d14] min-[400px]:size-[54px] sm:size-[58px]">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-white/[0.02]" />
                        )}

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"
                        />
                      </div>

                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden">
                          <h3
                            className={[
                              'truncate font-serif text-sm font-medium sm:text-[15px]',
                              isSelected ? 'text-[#ebcf91]' : 'text-[#d9d5cf]',
                            ].join(' ')}
                          >
                            {mantra.title}
                          </h3>

                          {mantra.deity ? (
                            <span className="hidden shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[8px] text-[#626b76] sm:inline-flex">
                              {mantra.deity}
                            </span>
                          ) : null}
                        </div>

                        <p className="font-devanagari mt-1 truncate text-[11px] text-[#b99a65] sm:text-xs">
                          {mantra.sanskrit}
                        </p>

                        <p className="mt-1 truncate text-[9px] text-[#626b76] sm:text-[10px]">
                          {mantra.transliteration}
                        </p>
                      </div>

                      <div
                        className={[
                          'flex size-6 shrink-0 items-center justify-center rounded-full border transition',
                          isSelected
                            ? 'border-[#e7b353]/60 bg-[linear-gradient(145deg,#dda13e,#b86e22)] text-[#1c1207] shadow-[0_0_12px_rgba(216,154,53,0.1)]'
                            : 'border-white/[0.14] bg-transparent text-transparent',
                        ].join(' ')}
                      >
                        {isSelected ? (
                          <Check size={14} strokeWidth={2.4} />
                        ) : (
                          <Circle size={12} />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-5 h-px bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.12)_15%,rgba(216,154,53,0.13)_50%,rgba(148,163,184,0.12)_85%,transparent)]" />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full border border-[#d89a35]/25 bg-[#d89a35]/[0.065] text-[9px] font-semibold text-[#e2ac4c] shadow-[0_0_16px_rgba(216,154,53,0.035)]">
                2
              </div>

              <div>
                <h2 className="font-serif text-sm font-medium text-[#ddd4c7] sm:text-[15px]">
                  Set Your Target
                </h2>

                <p className="mt-0.5 text-[9px] text-[#626b76]">
                  Choose your chant count
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
              {PRACTICE_TARGET_OPTIONS.map((target) => {
                const isSelected = !isCustomTarget && selectedTarget === target;

                return (
                  <button
                    key={target}
                    type="button"
                    onClick={() => handlePresetTarget(target)}
                    aria-pressed={isSelected}
                    className={[
                      'min-h-[58px] rounded-[9px] border px-2 py-2.5 text-center transition-all',
                      isSelected
                        ? [
                            'border-[#d89a35]/55',
                            'bg-[#d89a35]/[0.075]',
                            'text-[#e9be69]',
                            'shadow-[0_0_16px_rgba(216,154,53,0.045)]',
                          ].join(' ')
                        : [
                            'border-white/[0.065]',
                            'bg-white/[0.016]',
                            'text-[#8b939e]',
                            'hover:border-white/[0.11]',
                            'hover:bg-white/[0.025]',
                          ].join(' '),
                    ].join(' ')}
                  >
                    <span className="block font-serif text-sm sm:text-base">
                      {target}
                    </span>

                    <span className="mt-0.5 block text-[8px] uppercase tracking-[0.12em] opacity-60">
                      {target === 108
                        ? '1 Mala'
                        : target === 216
                          ? '2 Mala'
                          : '9 Mala'}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleCustomTarget}
                aria-pressed={isCustomTarget}
                className={[
                  'min-h-[58px] rounded-[9px] border px-2 py-2.5 text-center transition-all',
                  isCustomTarget
                    ? [
                        'border-[#d89a35]/55',
                        'bg-[#d89a35]/[0.075]',
                        'text-[#e9be69]',
                        'shadow-[0_0_16px_rgba(216,154,53,0.045)]',
                      ].join(' ')
                    : [
                        'border-white/[0.065]',
                        'bg-white/[0.016]',
                        'text-[#8b939e]',
                        'hover:border-white/[0.11]',
                        'hover:bg-white/[0.025]',
                      ].join(' '),
                ].join(' ')}
              >
                <span className="block font-serif text-sm sm:text-base">
                  Custom
                </span>

                <span className="mt-0.5 block text-[8px] uppercase tracking-[0.12em] opacity-60">
                  Set own
                </span>
              </button>
            </div>

            {isCustomTarget ? (
              <div className="mt-2">
                <input
                  type="number"
                  min={MIN_CUSTOM_PRACTICE_TARGET}
                  max={MAX_CUSTOM_PRACTICE_TARGET}
                  value={customTarget}
                  onChange={(event) => setCustomTarget(event.target.value)}
                  placeholder="Enter chant count"
                  className="ds-input h-10 w-full rounded-[9px] px-3 text-xs outline-none"
                />

                {!isValidCustomTarget ? (
                  <p className="mt-1.5 text-[10px] text-red-300/80">
                    Enter a whole number between {MIN_CUSTOM_PRACTICE_TARGET}{' '}
                    and {MAX_CUSTOM_PRACTICE_TARGET}.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {selectedMantra ? (
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-[10px] border border-white/[0.06] bg-[#090f17] px-3 py-3 min-[420px]:grid-cols-[1fr_auto_auto] min-[420px]:items-center">
              <div className="min-w-0">
                <p className="text-[8px] uppercase tracking-[0.15em] text-[#59616c]">
                  Selected
                </p>

                <p className="mt-1 truncate font-serif text-xs text-[#d9d5cf] sm:text-sm">
                  {selectedMantra.title}
                </p>
              </div>

              <div className="border-t border-white/[0.06] pt-2 min-[420px]:border-l min-[420px]:border-t-0 min-[420px]:pl-3 min-[420px]:pt-0 min-[420px]:text-right">
                <p className="text-[8px] uppercase tracking-[0.12em] text-[#59616c]">
                  Target
                </p>

                <p className="mt-1 font-serif text-sm text-[#e0b55f]">
                  {Number.isFinite(targetCount) && targetCount > 0
                    ? targetCount
                    : '—'}
                </p>
              </div>

              <div className="border-t border-white/[0.06] pt-2 min-[420px]:border-l min-[420px]:border-t-0 min-[420px]:pl-3 min-[420px]:pt-0 min-[420px]:text-right">
                <p className="flex items-center gap-1 text-[8px] uppercase tracking-[0.12em] text-[#59616c] min-[420px]:justify-end">
                  <Clock3 size={10} />
                  Time
                </p>

                <p className="mt-1 text-[10px] text-[#a7a9ab]">
                  {estimatedMinutes ? `~${estimatedMinutes} min` : 'Varies'}
                </p>
              </div>
            </div>
          ) : null}

          {createSession.isError ? (
            <p className="mt-3 rounded-[9px] border border-red-400/20 bg-red-400/[0.04] px-3 py-2.5 text-xs text-red-200">
              Unable to start your practice. Please try again.
            </p>
          ) : null}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleStartPractice}
              disabled={
                !selectedMantra ||
                createSession.isPending ||
                (isCustomTarget && !isValidCustomTarget)
              }
              className="ds-gold-button inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[9px] px-5 text-[11px] font-semibold sm:w-auto sm:min-w-[190px]"
            >
              {createSession.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Preparing Session...
                </>
              ) : (
                <>
                  Start Session
                  <ArrowRight size={16} strokeWidth={2} />
                </>
              )}
            </button>
          </div>

          <p className="mt-2.5 text-center text-[8px] leading-4 text-[#59616c]">
            Find a quiet space. Breathe. Chant. Transform.
          </p>
        </section>
      </div>
    </main>
  );
}

function ResumeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/[0.055] bg-black/10 px-2 py-2 text-center">
      <p className="text-[7px] uppercase tracking-[0.12em] text-[#59616c]">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-medium text-[#d8aa52]">
        {value}
      </p>
    </div>
  );
}
