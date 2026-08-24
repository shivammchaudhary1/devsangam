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
        <Loader2 className="size-7 animate-spin text-amber-400" />
      </div>
    );
  }

  if (isError || !mantras.length) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6 text-center">
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
    <main className="min-h-full bg-[#07111f] px-3 pb-28 pt-5 text-white sm:px-5 md:pb-10 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[900px]">
        <header className="mb-5 lg:mb-6">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles size={15} strokeWidth={1.8} />

            <span className="text-[11px] font-semibold uppercase tracking-[0.19em]">
              Start Practice
            </span>
          </div>

          <h1 className="mt-2 font-serif text-2xl font-medium tracking-wide text-[#f5e8c0] sm:text-3xl">
            Begin Your Sadhana
          </h1>

          <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
            Choose a mantra, set your target, and begin your chanting practice.
          </p>
        </header>

        {resumableSession ? (
          <section className="mb-4 overflow-hidden rounded-2xl border border-amber-400/30 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(11,20,33,0.95)_42%,rgba(11,20,33,1))] shadow-[0_0_30px_rgba(245,158,11,0.06)]">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-amber-400/20 bg-[#08111d]">
                  {resumableMantra && MANTRA_IMAGES[resumableMantra.slug] ? (
                    <img
                      src={MANTRA_IMAGES[resumableMantra.slug]}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <RotateCcw className="size-5 text-amber-400/70" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {resumableSession.status === 'paused' ? (
                      <Pause className="size-3.5 text-amber-400" />
                    ) : (
                      <Play className="size-3.5 text-amber-400" />
                    )}

                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-400">
                      Continue Sadhana
                    </p>
                  </div>

                  <h2 className="mt-1 truncate font-serif text-sm text-[#f0dfad] sm:text-base">
                    {resumableMantra?.title ?? resumableSession.mantraSlug}
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-500">
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
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300/70 bg-gradient-to-b from-[#f3c45d] to-[#d89627] px-4 text-xs font-semibold text-[#241704] shadow-[0_0_18px_rgba(245,158,11,0.12)] transition hover:brightness-105"
              >
                <Play size={14} fill="currentColor" />
                Resume
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/[0.09] bg-[#0b1421] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.22)] sm:p-4 lg:p-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/[0.07] text-[10px] font-semibold text-amber-300">
                1
              </div>

              <div>
                <h2 className="font-serif text-sm font-medium text-[#f0dfad] sm:text-base">
                  Choose Your Mantra
                </h2>

                <p className="text-[10px] text-slate-500">
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
                      'group w-full rounded-xl border text-left transition-all duration-200',
                      isSelected
                        ? [
                            'border-amber-400/70',
                            'bg-gradient-to-r from-amber-400/[0.10] via-amber-400/[0.055] to-transparent',
                            'shadow-[0_0_24px_rgba(245,158,11,0.10)]',
                          ].join(' ')
                        : [
                            'border-white/[0.08]',
                            'bg-white/[0.025]',
                            'hover:border-white/[0.14]',
                            'hover:bg-white/[0.04]',
                          ].join(' '),
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 p-2.5 sm:p-3">
                      <div className="relative size-[54px] shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#080f18] sm:size-[60px]">
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
                          <div className="h-full w-full bg-white/[0.03]" />
                        )}

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3
                            className={[
                              'truncate font-serif text-sm font-medium sm:text-[15px]',
                              isSelected ? 'text-[#f4dfac]' : 'text-slate-200',
                            ].join(' ')}
                          >
                            {mantra.title}
                          </h3>

                          {mantra.deity ? (
                            <span className="hidden shrink-0 rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] text-slate-500 sm:inline-flex">
                              {mantra.deity}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 truncate font-serif text-[11px] text-amber-100/70 sm:text-xs">
                          {mantra.sanskrit}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-[11px]">
                          {mantra.transliteration}
                        </p>
                      </div>

                      <div
                        className={[
                          'flex size-6 shrink-0 items-center justify-center rounded-full border transition',
                          isSelected
                            ? 'border-amber-300 bg-amber-400 text-[#291a04]'
                            : 'border-slate-600 bg-transparent text-transparent',
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

          <div className="my-4 border-t border-white/[0.07]" />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/[0.07] text-[10px] font-semibold text-amber-300">
                2
              </div>

              <div>
                <h2 className="font-serif text-sm font-medium text-[#f0dfad] sm:text-base">
                  Set Your Target
                </h2>

                <p className="text-[10px] text-slate-500">
                  Choose your chant count
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {PRACTICE_TARGET_OPTIONS.map((target) => {
                const isSelected = !isCustomTarget && selectedTarget === target;

                return (
                  <button
                    key={target}
                    type="button"
                    onClick={() => handlePresetTarget(target)}
                    aria-pressed={isSelected}
                    className={[
                      'min-h-[58px] rounded-xl border px-2 py-2.5 text-center transition-all',
                      isSelected
                        ? [
                            'border-amber-400/70',
                            'bg-amber-400/[0.09]',
                            'text-[#f4d77f]',
                            'shadow-[0_0_18px_rgba(245,158,11,0.07)]',
                          ].join(' ')
                        : [
                            'border-white/[0.08]',
                            'bg-white/[0.025]',
                            'text-slate-400',
                            'hover:border-white/[0.14]',
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
                  'min-h-[58px] rounded-xl border px-2 py-2.5 text-center transition-all',
                  isCustomTarget
                    ? [
                        'border-amber-400/70',
                        'bg-amber-400/[0.09]',
                        'text-[#f4d77f]',
                      ].join(' ')
                    : [
                        'border-white/[0.08]',
                        'bg-white/[0.025]',
                        'text-slate-400',
                        'hover:border-white/[0.14]',
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
                  className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#08111d] px-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-amber-400/50"
                />

                {!isValidCustomTarget ? (
                  <p className="mt-1.5 text-[10px] text-red-300/80">
                    Enter a whole number between 1 and 100000.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {selectedMantra ? (
            <div className="mt-4 grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#08111c] px-3 py-3">
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
                  Selected
                </p>

                <p className="mt-1 truncate font-serif text-xs text-slate-200 sm:text-sm">
                  {selectedMantra.title}
                </p>
              </div>

              <div className="border-l border-white/[0.07] pl-3 text-right">
                <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
                  Target
                </p>

                <p className="mt-1 font-serif text-sm text-[#e7c76e]">
                  {Number.isFinite(targetCount) && targetCount > 0
                    ? targetCount
                    : '—'}
                </p>
              </div>

              <div className="border-l border-white/[0.07] pl-3 text-right">
                <p className="flex items-center justify-end gap-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                  <Clock3 size={10} />
                  Time
                </p>

                <p className="mt-1 text-[11px] text-slate-300">
                  {estimatedMinutes ? `~${estimatedMinutes} min` : 'Varies'}
                </p>
              </div>
            </div>
          ) : null}

          {createSession.isError ? (
            <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-3 py-2.5 text-xs text-red-200">
              Unable to start your practice. Please try again.
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleStartPractice}
            disabled={
              !selectedMantra ||
              createSession.isPending ||
              (isCustomTarget && !isValidCustomTarget)
            }
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-300/70 bg-gradient-to-b from-[#f3c45d] to-[#d89627] px-5 text-sm font-semibold text-[#241704] shadow-[0_0_24px_rgba(245,158,11,0.14)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100"
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

          <p className="mt-2.5 text-center text-[9px] leading-4 text-slate-600">
            Find a quiet space. Breathe. Chant. Transform.
          </p>
        </section>
      </div>
    </main>
  );
}

function ResumeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-black/10 px-2 py-2 text-center">
      <p className="text-[7px] uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-medium text-[#e7c76e]">
        {value}
      </p>
    </div>
  );
}
