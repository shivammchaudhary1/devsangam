import { CircleAlert, RotateCcw } from 'lucide-react';

type ErrorStateProps = {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  retryLabel = 'Try again',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={[
        'rounded-[10px] border border-red-400/15',
        'bg-red-400/[0.025] px-5 py-7 text-center',
        className,
      ].join(' ')}
    >
      <div className="mx-auto flex size-9 items-center justify-center rounded-full border border-red-400/15 bg-red-400/[0.05] text-red-300/75">
        <CircleAlert size={16} strokeWidth={1.7} />
      </div>

      <p className="mt-3 font-serif text-[15px] text-[var(--ds-text)]">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-[var(--ds-muted)]">
        {message}
      </p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-[7px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 text-[10px] font-medium text-[var(--ds-soft-gold)] transition hover:bg-[var(--ds-amber-08)]"
        >
          <RotateCcw size={12} strokeWidth={1.7} />

          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
