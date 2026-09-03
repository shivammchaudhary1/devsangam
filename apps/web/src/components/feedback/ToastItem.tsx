import type {
  ToastId,
  ToastItem as ToastItemData,
  ToastVariant,
} from './toast.types';
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';

type ToastItemProps = {
  toast: ToastItemData;
  onDismiss: (id: ToastId) => void;
};

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const appearance = getToastAppearance(toast.variant);

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={[
        'pointer-events-auto relative overflow-hidden',
        'rounded-[10px] border backdrop-blur-xl',
        'shadow-[var(--ds-shadow-card-deep)]',
        appearance.container,
      ].join(' ')}
    >
      <div
        aria-hidden="true"
        className={[
          'absolute inset-y-0 left-0 w-[3px]',
          appearance.accent,
        ].join(' ')}
      />

      <div
        className={
          'flex min-h-[58px] items-start ' + 'gap-3 px-4 py-3.5 pl-4.5'
        }
      >
        <div
          className={[
            'mt-0.5 flex size-7 shrink-0',
            'items-center justify-center',
            'rounded-full border',
            appearance.iconContainer,
          ].join(' ')}
        >
          {appearance.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-[10px] font-semibold uppercase',
              'tracking-[0.11em]',
              appearance.label,
            ].join(' ')}
          >
            {appearance.title}
          </p>

          <p
            className={
              'mt-1 text-[11px] leading-[18px] ' + 'text-[var(--ds-text)]'
            }
          >
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          className={
            'flex size-7 shrink-0 items-center justify-center ' +
            'rounded-full text-[var(--ds-muted-soft)] transition ' +
            'hover:bg-[var(--ds-white-06)] ' +
            'hover:text-[var(--ds-cream)]'
          }
        >
          <X size={13} strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}

type ToastAppearance = {
  title: string;
  container: string;
  accent: string;
  iconContainer: string;
  label: string;
  icon: ReactNode;
};

function getToastAppearance(variant: ToastVariant): ToastAppearance {
  switch (variant) {
    case 'success':
      return {
        title: 'Success',

        container: 'border-[var(--ds-border-soft)] bg-[var(--ds-elevated)]',

        accent: 'bg-[var(--ds-success)]',

        iconContainer:
          'border-[var(--ds-border-soft)] ' +
          'bg-[var(--ds-white-03)] ' +
          'text-[var(--ds-success)]',

        label: 'text-[var(--ds-success)]',

        icon: <CheckCircle2 size={14} strokeWidth={1.7} />,
      };

    case 'error':
      return {
        title: 'Unable to Complete',

        container: 'border-[var(--ds-border-soft)] bg-[var(--ds-elevated)]',

        accent: 'bg-[var(--ds-danger)]',

        iconContainer:
          'border-[var(--ds-border-soft)] ' +
          'bg-[var(--ds-white-03)] ' +
          'text-[var(--ds-danger)]',

        label: 'text-[var(--ds-danger)]',

        icon: <CircleAlert size={14} strokeWidth={1.7} />,
      };

    case 'warning':
      return {
        title: 'Attention',

        container: 'border-[var(--ds-border-gold)] bg-[var(--ds-elevated)]',

        accent: 'bg-[var(--ds-amber)]',

        iconContainer:
          'border-[var(--ds-border-gold)] ' +
          'bg-[var(--ds-amber-05)] ' +
          'text-[var(--ds-soft-gold)]',

        label: 'text-[var(--ds-gold)]',

        icon: <TriangleAlert size={14} strokeWidth={1.7} />,
      };

    case 'info':
      return {
        title: 'DevSangam',

        container: 'border-[var(--ds-border-soft)] bg-[var(--ds-elevated)]',

        accent: 'bg-[var(--ds-gold)]',

        iconContainer:
          'border-[var(--ds-border-gold)] ' +
          'bg-[var(--ds-amber-05)] ' +
          'text-[var(--ds-gold)]',

        label: 'text-[var(--ds-gold)]',

        icon: <Info size={14} strokeWidth={1.7} />,
      };
  }
}
