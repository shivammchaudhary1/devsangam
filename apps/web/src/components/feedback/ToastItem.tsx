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
        'shadow-[0_18px_45px_rgba(0,0,0,0.42)]',
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

      <div className="flex min-h-[58px] items-start gap-3 px-4 py-3.5 pl-4.5">
        <div
          className={[
            'mt-0.5 flex size-7 shrink-0 items-center justify-center',
            'rounded-full border',
            appearance.iconContainer,
          ].join(' ')}
        >
          {appearance.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-[10px] font-semibold uppercase tracking-[0.11em]',
              appearance.label,
            ].join(' ')}
          >
            {appearance.title}
          </p>

          <p className="mt-1 text-[11px] leading-[18px] text-[var(--ds-text)]">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          className={[
            'flex size-7 shrink-0 items-center justify-center rounded-full',
            'text-[var(--ds-muted-soft)] transition',
            'hover:bg-white/[0.05] hover:text-[var(--ds-cream)]',
          ].join(' ')}
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
        container: 'border-emerald-400/15 bg-[#09110f]/95',
        accent: 'bg-emerald-400/70',
        iconContainer:
          'border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300/80',
        label: 'text-emerald-300/75',
        icon: <CheckCircle2 size={14} strokeWidth={1.7} />,
      };

    case 'error':
      return {
        title: 'Unable to Complete',
        container: 'border-red-400/15 bg-[#130b0d]/95',
        accent: 'bg-red-400/70',
        iconContainer: 'border-red-400/15 bg-red-400/[0.06] text-red-300/80',
        label: 'text-red-300/75',
        icon: <CircleAlert size={14} strokeWidth={1.7} />,
      };

    case 'warning':
      return {
        title: 'Attention',
        container: 'border-[var(--ds-border-gold)] bg-[#121009]/95',
        accent: 'bg-[var(--ds-amber)]',
        iconContainer:
          'border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] text-[var(--ds-soft-gold)]',
        label: 'text-[var(--ds-gold)]',
        icon: <TriangleAlert size={14} strokeWidth={1.7} />,
      };

    case 'info':
      return {
        title: 'DevSangam',
        container: 'border-white/[0.08] bg-[#090e15]/95',
        accent: 'bg-[var(--ds-gold)]',
        iconContainer:
          'border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] text-[var(--ds-gold)]',
        label: 'text-[var(--ds-gold)]',
        icon: <Info size={14} strokeWidth={1.7} />,
      };
  }
}
