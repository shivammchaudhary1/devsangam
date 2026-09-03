import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  message,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex min-h-[150px] items-center justify-center',
        'rounded-[10px] border border-dashed border-[var(--ds-border-soft)]',
        'bg-[var(--ds-white-03)] px-6 text-center',
        className,
      ].join(' ')}
    >
      <div>
        <div className="mx-auto flex size-9 items-center justify-center text-[var(--ds-gold)]">
          {icon ?? <Sparkles size={19} strokeWidth={1.6} />}
        </div>

        <p className="mt-2 font-serif text-[15px] text-[var(--ds-text)]">
          {title}
        </p>

        <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-[var(--ds-muted)]">
          {message}
        </p>

        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
