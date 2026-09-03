import { APP_ROUTES } from '@/app/constants/routes.constants';
import { Check, Download, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { matchPath, useLocation } from 'react-router';
import { registerSW } from 'virtual:pwa-register';

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

export function PwaUpdateManager() {
  const location = useLocation();

  const [offlineReady, setOfflineReady] = useState(false);

  const [needRefresh, setNeedRefresh] = useState(false);

  const updateServiceWorkerRef = useRef<UpdateServiceWorker | null>(null);

  useEffect(() => {
    updateServiceWorkerRef.current = registerSW({
      onOfflineReady() {
        setOfflineReady(true);
      },

      onNeedRefresh() {
        setNeedRefresh(true);
      },

      onRegisterError(error) {
        console.error('DevSangam service worker registration failed.', error);
      },
    });
  }, []);

  const isPracticeSession = Boolean(
    matchPath(APP_ROUTES.practiceSession, location.pathname)
  );

  const handleUpdate = useCallback(() => {
    if (isPracticeSession) {
      return;
    }

    const updateServiceWorker = updateServiceWorkerRef.current;

    if (!updateServiceWorker) {
      return;
    }

    void updateServiceWorker(true);
  }, [isPracticeSession]);

  if (!offlineReady && !needRefresh) {
    return null;
  }

  if (needRefresh) {
    return (
      <aside
        role="status"
        aria-live="polite"
        className={
          'fixed inset-x-3 bottom-[94px] z-[100] mx-auto ' +
          'max-w-[430px] rounded-[12px] border ' +
          'border-[var(--ds-border-gold)] bg-[var(--ds-elevated)] ' +
          'p-3.5 shadow-[var(--ds-shadow-card-deep)] ' +
          'backdrop-blur-xl md:inset-x-auto md:bottom-5 ' +
          'md:right-5 md:mx-0 md:w-[390px]'
        }
      >
        <div className={'flex items-start gap-3'}>
          <div
            className={
              'flex size-9 shrink-0 items-center justify-center ' +
              'rounded-[9px] border border-[var(--ds-border-gold)] ' +
              'bg-[var(--ds-amber-05)]'
            }
          >
            <RefreshCw
              size={16}
              strokeWidth={1.7}
              className="text-[var(--ds-gold)]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={
                'font-serif text-[13px] ' + 'text-[var(--ds-soft-gold)]'
              }
            >
              DevSangam update ready
            </p>

            <p
              className={
                'mt-1 text-[9px] leading-4 ' + 'text-[var(--ds-muted)]'
              }
            >
              {isPracticeSession
                ? 'Your Sadhana is in progress. ' +
                  'Finish or exit the session before updating.'
                : 'A newer version is ready. Update when convenient ' +
                  'to use the latest DevSangam experience.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            aria-label="Dismiss update"
            className={
              'flex size-7 shrink-0 items-center justify-center ' +
              'rounded-[7px] text-[var(--ds-muted)] transition ' +
              'hover:bg-[var(--ds-white-06)] ' +
              'hover:text-[var(--ds-text)]'
            }
          >
            <X size={14} strokeWidth={1.7} />
          </button>
        </div>

        <div className={'mt-3 flex justify-end gap-2'}>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className={'ds-secondary-button min-h-9 px-3 text-[9px]'}
          >
            Later
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={isPracticeSession}
            className={
              'ds-gold-button inline-flex min-h-9 items-center ' +
              'justify-center gap-2 px-3 text-[9px] ' +
              'disabled:cursor-not-allowed disabled:opacity-40'
            }
          >
            <Download size={13} strokeWidth={1.8} />

            {isPracticeSession ? 'Finish Sadhana First' : 'Update Now'}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className={
        'fixed inset-x-3 bottom-[94px] z-[100] mx-auto ' +
        'max-w-[390px] rounded-[11px] border ' +
        'border-[var(--ds-border-soft)] bg-[var(--ds-elevated)] ' +
        'p-3 shadow-[var(--ds-shadow-card-deep)] ' +
        'backdrop-blur-xl md:inset-x-auto md:bottom-5 ' +
        'md:right-5 md:mx-0 md:w-[350px]'
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={
            'flex size-8 shrink-0 items-center justify-center ' +
            'rounded-[8px] border border-[var(--ds-border-soft)] ' +
            'bg-[var(--ds-white-03)]'
          }
        >
          <Check
            size={14}
            strokeWidth={1.8}
            className="text-[var(--ds-success)]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className={'text-[10px] font-medium ' + 'text-[var(--ds-text)]'}>
            Ready for offline practice
          </p>

          <p className={'mt-0.5 text-[8px] ' + 'text-[var(--ds-muted)]'}>
            DevSangam can now load without a connection.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOfflineReady(false)}
          aria-label="Dismiss offline ready message"
          className={
            'flex size-7 shrink-0 items-center justify-center ' +
            'rounded-[7px] text-[var(--ds-muted)] transition ' +
            'hover:bg-[var(--ds-white-06)] ' +
            'hover:text-[var(--ds-text)]'
          }
        >
          <X size={14} strokeWidth={1.7} />
        </button>
      </div>
    </aside>
  );
}
