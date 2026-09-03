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
import { MANTRA_SEARCH_DEBOUNCE_MS } from '@/features/mantras/constants/mantra.constants';
import { MANTRA_IMAGES } from '@/features/mantras/constants/mantra-images';
import { useFavorites } from '@/features/mantras/hooks/useFavorites';
import { useMantra } from '@/features/mantras/hooks/useMantra';
import { useMantras } from '@/features/mantras/hooks/useMantras';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Mantra } from '@devsangam/types';
import {
  ArrowRight,
  Check,
  Circle,
  Clock3,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const PRACTICE_MANTRA_LIMIT = 5;

export function PracticeSetupPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const mantraFromQuery = searchParams.get('mantra');

  const hasRequestedMantra = Boolean(mantraFromQuery);

  const [mantraSearch, setMantraSearch] = useState('');

  const debouncedMantraSearch = useDebouncedValue(
    mantraSearch,
    MANTRA_SEARCH_DEBOUNCE_MS
  );

  const requestedMantraQuery = useMantra(mantraFromQuery ?? undefined);

  const browseMantrasQuery = useMantras(
    {
      search: debouncedMantraSearch.trim() || undefined,
    },
    {
      enabled: !hasRequestedMantra,
    }
  );

  const { data: favoriteMantras = [] } = useFavorites();

  const { data: serverSessions = [] } = usePracticeSessions();

  const { data: localSessions = [] } = useLocalPracticeSessions();

  const resumableSession = useMemo(
    () => getResumablePracticeSession(serverSessions, localSessions),
    [serverSessions, localSessions]
  );

  const resumableMantraQuery = useMantra(resumableSession?.mantraSlug);

  const createSession = useCreatePracticeSession();

  const [selectedMantraSlug, setSelectedMantraSlug] = useState<string | null>(
    null
  );

  const [selectedTarget, setSelectedTarget] = useState<number>(108);

  const [isCustomTarget, setIsCustomTarget] = useState(false);

  const [customTarget, setCustomTarget] = useState('');

  const browseMantras = useMemo(() => {
    const availableMantras = browseMantrasQuery.data ?? [];

    const newestMantras = [...availableMantras].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
    );

    if (debouncedMantraSearch.trim()) {
      return newestMantras.slice(0, PRACTICE_MANTRA_LIMIT);
    }

    if (!favoriteMantras.length) {
      return newestMantras.slice(0, PRACTICE_MANTRA_LIMIT);
    }

    const preferredAndNewest = [...favoriteMantras, ...newestMantras];

    const uniqueMantras = new Map<string, Mantra>();

    for (const mantra of preferredAndNewest) {
      if (!uniqueMantras.has(mantra.slug)) {
        uniqueMantras.set(mantra.slug, mantra);
      }
    }

    return Array.from(uniqueMantras.values()).slice(0, PRACTICE_MANTRA_LIMIT);
  }, [browseMantrasQuery.data, debouncedMantraSearch, favoriteMantras]);

  const selectableMantras = useMemo(() => {
    if (hasRequestedMantra) {
      return requestedMantraQuery.data ? [requestedMantraQuery.data] : [];
    }

    return browseMantras;
  }, [browseMantras, hasRequestedMantra, requestedMantraQuery.data]);

  const resolvedSelectedMantraSlug = useMemo(() => {
    if (
      selectedMantraSlug &&
      selectableMantras.some((mantra) => mantra.slug === selectedMantraSlug)
    ) {
      return selectedMantraSlug;
    }

    if (
      mantraFromQuery &&
      selectableMantras.some((mantra) => mantra.slug === mantraFromQuery)
    ) {
      return mantraFromQuery;
    }

    return selectableMantras[0]?.slug ?? '';
  }, [mantraFromQuery, selectableMantras, selectedMantraSlug]);

  const selectedMantra = useMemo(
    () =>
      selectableMantras.find(
        (mantra) => mantra.slug === resolvedSelectedMantraSlug
      ) ?? null,
    [resolvedSelectedMantraSlug, selectableMantras]
  );

  const resumableMantra =
    resumableMantraQuery.data ??
    selectableMantras.find(
      (mantra) => mantra.slug === resumableSession?.mantraSlug
    ) ??
    null;

  const resumableImage = resumableMantra
    ? getMantraImage(resumableMantra)
    : null;

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

  const isMantraLoading = hasRequestedMantra
    ? requestedMantraQuery.isLoading
    : browseMantrasQuery.isLoading;

  const isMantraError = hasRequestedMantra
    ? requestedMantraQuery.isError
    : browseMantrasQuery.isError;

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

  if (isMantraLoading) {
    return (
      <div className={'flex min-h-[65vh] items-center ' + 'justify-center'}>
        <Loader2 className={'size-7 animate-spin ' + 'text-[var(--ds-gold)]'} />
      </div>
    );
  }

  if (isMantraError || (hasRequestedMantra && !requestedMantraQuery.data)) {
    return (
      <div
        className={
          'mx-auto flex min-h-[65vh] max-w-xl ' +
          'items-center justify-center px-4'
        }
      >
        <div
          className={
            'w-full rounded-[12px] border ' +
            'border-red-400/20 bg-red-400/[0.035] ' +
            'p-6 text-center'
          }
        >
          <h1 className={'font-serif text-xl ' + 'text-[var(--ds-danger)]'}>
            Practice unavailable
          </h1>

          <p
            className={
              'mt-2 text-sm leading-6 ' + 'text-[var(--ds-danger)] opacity-80'
            }
          >
            We could not load the requested mantra. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className={
        'relative min-h-full overflow-hidden ' +
        'bg-[var(--ds-obsidian)] px-3 pb-28 pt-5 ' +
        'text-[var(--ds-cream)] sm:px-5 md:pb-10 ' +
        'lg:px-7 lg:py-6 xl:px-8'
      }
    >
      <div
        aria-hidden="true"
        className={'pointer-events-none absolute inset-0 overflow-hidden'}
      >
        <div
          className={
            'absolute left-[24%] top-[-220px] ' +
            'size-[480px] rounded-full ' +
            'bg-[#d89a35]/[0.025] blur-[120px]'
          }
        />

        <div
          className={
            'absolute bottom-[-220px] right-[-140px] ' +
            'size-[420px] rounded-full border ' +
            'border-[#d89a35]/[0.025]'
          }
        />
      </div>

      <div className={'relative z-10 mx-auto w-full max-w-[940px]'}>
        <header
          className={
            'mb-5 border-b border-[var(--ds-border-soft)] ' + 'pb-5 lg:mb-6'
          }
        >
          <div className="flex items-center gap-2">
            <Sparkles
              size={12}
              strokeWidth={1.7}
              className="text-[var(--ds-gold)]"
            />

            <span
              className={
                'text-[9px] font-semibold uppercase ' +
                'tracking-[0.18em] text-[var(--ds-gold)]'
              }
            >
              Start Practice
            </span>
          </div>

          <h1
            className={
              'mt-2 font-serif text-[25px] font-medium ' +
              'tracking-[0.015em] text-[var(--ds-cream)] ' +
              'sm:text-[29px]'
            }
          >
            Begin Your Sadhana
          </h1>

          <p
            className={
              'mt-1.5 max-w-2xl text-[11px] leading-5 ' +
              'text-[var(--ds-muted)] sm:text-xs'
            }
          >
            {hasRequestedMantra
              ? 'Set your target and begin practice ' +
                'with your selected mantra.'
              : 'Choose a mantra, set your intention, ' +
                'and enter your chanting practice.'}
          </p>
        </header>

        {resumableSession ? (
          <section
            className={
              'relative mb-4 overflow-hidden rounded-[12px] ' +
              'border border-[#d89a35]/25 ' +
              'bg-[var(--ds-gradient-panel)] ' +
              'shadow-[var(--ds-shadow-card)]'
            }
          >
            <div
              className={
                'flex flex-col gap-4 p-4 sm:flex-row ' +
                'sm:items-center sm:p-5'
              }
            >
              <div className={'flex min-w-0 flex-1 items-center gap-3'}>
                <div
                  className={
                    'relative size-14 shrink-0 overflow-hidden ' +
                    'rounded-[10px] border border-[#d89a35]/18 ' +
                    'bg-[var(--ds-sidebar)]'
                  }
                >
                  {resumableImage ? (
                    <img
                      src={resumableImage}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className={'h-full w-full object-cover'}
                    />
                  ) : (
                    <div
                      className={
                        'flex h-full w-full items-center ' + 'justify-center'
                      }
                    >
                      <RotateCcw
                        className={'size-5 text-[var(--ds-gold)] opacity-70'}
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className={'flex items-center gap-2'}>
                    {resumableSession.status === 'paused' ? (
                      <Pause className={'size-3.5 text-[var(--ds-gold)]'} />
                    ) : (
                      <Play className={'size-3.5 text-[var(--ds-gold)]'} />
                    )}

                    <p
                      className={
                        'text-[8px] font-semibold uppercase ' +
                        'tracking-[0.16em] text-[var(--ds-gold)]'
                      }
                    >
                      Continue Sadhana
                    </p>
                  </div>

                  <h2
                    className={
                      'mt-1 truncate font-serif text-sm font-medium ' +
                      'text-[var(--ds-cream)] sm:text-[15px]'
                    }
                  >
                    {resumableMantra?.title ?? resumableSession.mantraSlug}
                  </h2>

                  <p className={'mt-1 text-[10px] text-[var(--ds-muted)]'}>
                    Your unfinished practice is ready to continue.
                  </p>
                </div>
              </div>

              <div className={'grid grid-cols-3 gap-2 sm:w-[230px]'}>
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
                className={
                  'ds-gold-button inline-flex h-10 shrink-0 ' +
                  'items-center justify-center gap-2 rounded-[8px] ' +
                  'px-4 text-[10px] font-semibold'
                }
              >
                <Play size={14} fill="currentColor" />
                Resume
              </button>
            </div>
          </section>
        ) : null}

        <section
          className={
            'relative overflow-hidden rounded-[13px] border ' +
            'border-[var(--ds-border-soft)] ' +
            'bg-[var(--ds-gradient-panel-soft)] p-3 ' +
            'shadow-[var(--ds-shadow-card)] sm:p-4 lg:p-5'
          }
        >
          <div>
            <div className={'mb-3 flex items-center gap-2'}>
              <div
                className={
                  'flex size-6 items-center justify-center rounded-full ' +
                  'border border-[var(--ds-border-gold)] ' +
                  'bg-[var(--ds-amber-05)] text-[9px] font-semibold ' +
                  'text-[var(--ds-soft-gold)] ' +
                  'shadow-[var(--ds-shadow-gold)]'
                }
              >
                1
              </div>

              <div>
                <h2
                  className={
                    'font-serif text-sm font-medium ' +
                    'text-[var(--ds-cream)] sm:text-[15px]'
                  }
                >
                  {hasRequestedMantra
                    ? 'Selected Mantra'
                    : 'Choose Your Mantra'}
                </h2>

                <p className={'mt-0.5 text-[9px] text-[var(--ds-muted)]'}>
                  {hasRequestedMantra
                    ? 'Your selected mantra is ready for practice'
                    : 'Favorites are shown first, followed ' +
                      'by recently added mantras'}
                </p>
              </div>
            </div>

            {!hasRequestedMantra ? (
              <div className={'relative mb-3'}>
                <Search
                  aria-hidden="true"
                  size={14}
                  className={
                    'absolute left-3 top-1/2 z-10 ' +
                    '-translate-y-1/2 text-[var(--ds-muted)]'
                  }
                />

                <input
                  type="search"
                  value={mantraSearch}
                  onChange={(event) => setMantraSearch(event.target.value)}
                  placeholder="Search mantra, deity, meaning..."
                  className={
                    'h-10 w-full rounded-[9px] border ' +
                    'border-[var(--ds-border-soft)] ' +
                    'bg-[var(--ds-night)] pl-9 pr-3 text-xs ' +
                    'text-[var(--ds-cream)] outline-none transition ' +
                    'placeholder:text-[var(--ds-muted-soft)] ' +
                    'hover:border-[var(--ds-border-gold)] ' +
                    'focus:border-[var(--ds-border-gold)] ' +
                    'focus:shadow-[0_0_0_2px_var(--ds-amber-05)]'
                  }
                />
              </div>
            ) : null}

            {selectableMantras.length ? (
              <div className="grid gap-2">
                {selectableMantras.map((mantra) => {
                  const isSelected = mantra.slug === resolvedSelectedMantraSlug;

                  const image = getMantraImage(mantra);

                  return (
                    <button
                      key={mantra._id}
                      type="button"
                      onClick={() => setSelectedMantraSlug(mantra.slug)}
                      aria-pressed={isSelected}
                      className={[
                        'group w-full min-w-0 overflow-hidden',
                        'rounded-[10px] border text-left',
                        'transition-all duration-200',

                        isSelected
                          ? [
                              'border-[var(--ds-border-gold)]',
                              'bg-[var(--ds-amber-08)]',
                              'shadow-[var(--ds-shadow-gold-inset)]',
                            ].join(' ')
                          : [
                              'border-[var(--ds-border-soft)]',
                              'bg-[var(--ds-white-03)]',
                              'hover:border-[var(--ds-border-gold)]',
                              'hover:bg-[var(--ds-amber-03)]',
                            ].join(' '),
                      ].join(' ')}
                    >
                      <div
                        className={
                          'flex min-w-0 items-center gap-2.5 ' +
                          'p-2.5 min-[400px]:gap-3 sm:p-3'
                        }
                      >
                        <div
                          className={
                            'relative size-12 shrink-0 overflow-hidden ' +
                            'rounded-[8px] border ' +
                            'border-[var(--ds-border-soft)] ' +
                            'bg-[var(--ds-sidebar)] ' +
                            'min-[400px]:size-[54px] sm:size-[58px]'
                          }
                        >
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              decoding="async"
                              className={'h-full w-full object-cover'}
                            />
                          ) : (
                            <div
                              className={
                                'h-full w-full bg-[var(--ds-white-03)]'
                              }
                            />
                          )}

                          <div
                            aria-hidden="true"
                            className={
                              'pointer-events-none absolute inset-0 ' +
                              'bg-gradient-to-t from-black/35 to-transparent'
                            }
                          />
                        </div>

                        <div className={'min-w-0 flex-1 overflow-hidden'}>
                          <div
                            className={
                              'flex w-full min-w-0 items-center ' +
                              'gap-2 overflow-hidden'
                            }
                          >
                            <h3
                              className={[
                                'truncate font-serif text-sm font-medium',
                                'sm:text-[15px]',

                                isSelected
                                  ? 'text-[var(--ds-soft-gold)]'
                                  : 'text-[var(--ds-cream)]',
                              ].join(' ')}
                            >
                              {mantra.title}
                            </h3>

                            {mantra.deity ? (
                              <span
                                className={
                                  'hidden shrink-0 rounded-full border ' +
                                  'border-[var(--ds-border-soft)] ' +
                                  'px-2 py-0.5 text-[8px] ' +
                                  'text-[var(--ds-muted)] sm:inline-flex'
                                }
                              >
                                {mantra.deity}
                              </span>
                            ) : null}
                          </div>

                          <p
                            className={
                              'font-devanagari mt-1 truncate text-[11px] ' +
                              'text-[var(--ds-soft-gold)] sm:text-xs'
                            }
                          >
                            {mantra.sanskrit}
                          </p>

                          <p
                            className={
                              'mt-1 truncate text-[9px] ' +
                              'text-[var(--ds-muted)] sm:text-[10px]'
                            }
                          >
                            {mantra.transliteration}
                          </p>
                        </div>

                        <div
                          className={[
                            'flex size-6 shrink-0 items-center justify-center',
                            'rounded-full border transition',

                            isSelected
                              ? [
                                  'border-[var(--ds-border-gold)]',
                                  'bg-[var(--ds-gradient-gold)]',
                                  'text-[#1c1207]',
                                  'shadow-[var(--ds-shadow-gold)]',
                                ].join(' ')
                              : [
                                  'border-[var(--ds-border-soft)]',
                                  'bg-transparent',
                                  'text-transparent',
                                ].join(' '),
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
            ) : (
              <div
                className={
                  'rounded-[10px] border border-[var(--ds-border-soft)] ' +
                  'bg-[var(--ds-white-03)] px-4 py-6 text-center'
                }
              >
                <p className={'font-serif text-sm text-[var(--ds-cream)]'}>
                  No matching mantra
                </p>

                <p className={'mt-1 text-[10px] text-[var(--ds-muted)]'}>
                  Try a different search term.
                </p>
              </div>
            )}

            {!hasRequestedMantra &&
            !debouncedMantraSearch.trim() &&
            selectableMantras.length ? (
              <p
                className={'mt-2 text-right text-[8px] text-[var(--ds-muted)]'}
              >
                Showing up to {PRACTICE_MANTRA_LIMIT} preferred or recently
                added mantras
              </p>
            ) : null}
          </div>

          <div
            className={
              'my-5 h-px ' +
              'bg-[linear-gradient(90deg,transparent,var(--ds-border-soft)_15%,var(--ds-border-gold)_50%,var(--ds-border-soft)_85%,transparent)]'
            }
          />

          <div>
            <div className={'mb-3 flex items-center gap-2'}>
              <div
                className={
                  'flex size-6 items-center justify-center rounded-full ' +
                  'border border-[var(--ds-border-gold)] ' +
                  'bg-[var(--ds-amber-05)] text-[9px] font-semibold ' +
                  'text-[var(--ds-soft-gold)] ' +
                  'shadow-[var(--ds-shadow-gold)]'
                }
              >
                2
              </div>

              <div>
                <h2
                  className={
                    'font-serif text-sm font-medium ' +
                    'text-[var(--ds-cream)] sm:text-[15px]'
                  }
                >
                  Set Your Target
                </h2>

                <p className={'mt-0.5 text-[9px] text-[var(--ds-muted)]'}>
                  Choose your chant count
                </p>
              </div>
            </div>

            <div className={'grid grid-cols-2 gap-2 min-[420px]:grid-cols-4'}>
              {PRACTICE_TARGET_OPTIONS.map((target) => {
                const isSelected = !isCustomTarget && selectedTarget === target;

                return (
                  <button
                    key={target}
                    type="button"
                    onClick={() => handlePresetTarget(target)}
                    aria-pressed={isSelected}
                    className={[
                      'min-h-[58px] rounded-[9px] border',
                      'px-2 py-2.5 text-center transition-all',

                      isSelected
                        ? [
                            'border-[var(--ds-border-gold)]',
                            'bg-[var(--ds-amber-08)]',
                            'text-[var(--ds-soft-gold)]',
                            'shadow-[var(--ds-shadow-gold)]',
                          ].join(' ')
                        : [
                            'border-[var(--ds-border-soft)]',
                            'bg-[var(--ds-white-03)]',
                            'text-[var(--ds-muted)]',
                            'hover:border-[var(--ds-border-gold)]',
                            'hover:bg-[var(--ds-amber-03)]',
                          ].join(' '),
                    ].join(' ')}
                  >
                    <span className={'block font-serif text-sm sm:text-base'}>
                      {target}
                    </span>

                    <span
                      className={
                        'mt-0.5 block text-[8px] uppercase ' +
                        'tracking-[0.12em] opacity-60'
                      }
                    >
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
                  'min-h-[58px] rounded-[9px] border',
                  'px-2 py-2.5 text-center transition-all',

                  isCustomTarget
                    ? [
                        'border-[var(--ds-border-gold)]',
                        'bg-[var(--ds-amber-08)]',
                        'text-[var(--ds-soft-gold)]',
                        'shadow-[var(--ds-shadow-gold)]',
                      ].join(' ')
                    : [
                        'border-[var(--ds-border-soft)]',
                        'bg-[var(--ds-white-03)]',
                        'text-[var(--ds-muted)]',
                        'hover:border-[var(--ds-border-gold)]',
                        'hover:bg-[var(--ds-amber-03)]',
                      ].join(' '),
                ].join(' ')}
              >
                <span className={'block font-serif text-sm sm:text-base'}>
                  Custom
                </span>

                <span
                  className={
                    'mt-0.5 block text-[8px] uppercase ' +
                    'tracking-[0.12em] opacity-60'
                  }
                >
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
                  className={
                    'h-10 w-full rounded-[9px] border ' +
                    'border-[var(--ds-border-soft)] ' +
                    'bg-[var(--ds-night)] px-3 text-xs ' +
                    'text-[var(--ds-cream)] outline-none transition ' +
                    'placeholder:text-[var(--ds-muted-soft)] ' +
                    'hover:border-[var(--ds-border-gold)] ' +
                    'focus:border-[var(--ds-border-gold)] ' +
                    'focus:shadow-[0_0_0_2px_var(--ds-amber-05)]'
                  }
                />

                {!isValidCustomTarget ? (
                  <p
                    className={
                      'mt-1.5 text-[10px] ' + 'text-[var(--ds-danger)]'
                    }
                  >
                    Enter a whole number between {MIN_CUSTOM_PRACTICE_TARGET}{' '}
                    and {MAX_CUSTOM_PRACTICE_TARGET}.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {selectedMantra ? (
            <div
              className={
                'mt-4 grid grid-cols-1 gap-3 rounded-[10px] ' +
                'border border-[var(--ds-border-soft)] ' +
                'bg-[var(--ds-night)] px-3 py-3 ' +
                'min-[420px]:grid-cols-[1fr_auto_auto] ' +
                'min-[420px]:items-center'
              }
            >
              <div className="min-w-0">
                <p
                  className={
                    'text-[8px] uppercase tracking-[0.15em] ' +
                    'text-[var(--ds-muted)]'
                  }
                >
                  Selected
                </p>

                <p
                  className={
                    'mt-1 truncate font-serif text-xs ' +
                    'text-[var(--ds-cream)] sm:text-sm'
                  }
                >
                  {selectedMantra.title}
                </p>
              </div>

              <div
                className={
                  'border-t border-[var(--ds-border-soft)] pt-2 ' +
                  'min-[420px]:border-l min-[420px]:border-t-0 ' +
                  'min-[420px]:pl-3 min-[420px]:pt-0 ' +
                  'min-[420px]:text-right'
                }
              >
                <p
                  className={
                    'text-[8px] uppercase tracking-[0.12em] ' +
                    'text-[var(--ds-muted)]'
                  }
                >
                  Target
                </p>

                <p
                  className={
                    'mt-1 font-serif text-sm ' + 'text-[var(--ds-soft-gold)]'
                  }
                >
                  {Number.isFinite(targetCount) && targetCount > 0
                    ? targetCount
                    : '—'}
                </p>
              </div>

              <div
                className={
                  'border-t border-[var(--ds-border-soft)] pt-2 ' +
                  'min-[420px]:border-l min-[420px]:border-t-0 ' +
                  'min-[420px]:pl-3 min-[420px]:pt-0 ' +
                  'min-[420px]:text-right'
                }
              >
                <p
                  className={
                    'flex items-center gap-1 text-[8px] uppercase ' +
                    'tracking-[0.12em] text-[var(--ds-muted)] ' +
                    'min-[420px]:justify-end'
                  }
                >
                  <Clock3 size={10} />
                  Time
                </p>

                <p className={'mt-1 text-[10px] text-[var(--ds-text)]'}>
                  {estimatedMinutes ? `~${estimatedMinutes} min` : 'Varies'}
                </p>
              </div>
            </div>
          ) : null}

          {createSession.isError ? (
            <p
              className={
                'mt-3 rounded-[9px] border border-red-400/20 ' +
                'bg-red-400/[0.04] px-3 py-2.5 text-xs ' +
                'text-[var(--ds-danger)]'
              }
            >
              Unable to start your practice. Please try again.
            </p>
          ) : null}

          <div className={'mt-4 flex justify-end'}>
            <button
              type="button"
              onClick={handleStartPractice}
              disabled={
                !selectedMantra ||
                createSession.isPending ||
                (isCustomTarget && !isValidCustomTarget)
              }
              className={
                'ds-gold-button inline-flex min-h-11 w-full ' +
                'items-center justify-center gap-2 rounded-[9px] ' +
                'px-5 text-[11px] font-semibold sm:w-auto ' +
                'sm:min-w-[190px]'
              }
            >
              {createSession.isPending ? (
                <>
                  <Loader2 className={'size-4 animate-spin'} />
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

          <p
            className={
              'mt-2.5 text-center text-[8px] leading-4 ' +
              'text-[var(--ds-muted)]'
            }
          >
            Find a quiet space. Breathe. Chant. Transform.
          </p>
        </section>
      </div>
    </main>
  );
}

function getMantraImage(mantra: Mantra) {
  return mantra.image || MANTRA_IMAGES[mantra.slug] || null;
}

function ResumeStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={
        'rounded-[8px] border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-white-03)] px-2 py-2 text-center'
      }
    >
      <p
        className={
          'text-[7px] uppercase tracking-[0.12em] ' + 'text-[var(--ds-muted)]'
        }
      >
        {label}
      </p>

      <p
        className={
          'mt-1 truncate text-[10px] font-medium ' + 'text-[var(--ds-gold)]'
        }
      >
        {value}
      </p>
    </div>
  );
}
