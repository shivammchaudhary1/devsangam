import type { LucideIcon } from 'lucide-react';
import { memo } from 'react';

type InsightMetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  emphasized?: boolean;
};

export const InsightMetricCard = memo(function InsightMetricCard({
  label,
  value,
  description,
  icon: Icon,
  emphasized = false,
}: InsightMetricCardProps) {
  return (
    <article
      className={[
        'group relative overflow-hidden rounded-[11px]',
        'border px-4 py-4 transition-all duration-200',
        emphasized
          ? [
              'border-[var(--ds-border-gold)]',
              'bg-[var(--ds-gradient-panel)]',
              'shadow-[var(--ds-shadow-card)]',
            ].join(' ')
          : [
              'border-[var(--ds-border-soft)]',
              'bg-[var(--ds-gradient-panel-soft)]',
              'shadow-[var(--ds-shadow-card)]',
            ].join(' '),
      ].join(' ')}
    >
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute -right-10 -top-12',
          'size-28 rounded-full blur-3xl',
          emphasized ? 'bg-[var(--ds-amber-08)]' : 'bg-[var(--ds-white-03)]',
        ].join(' ')}
      />

      <div className={'relative flex items-center gap-3.5'}>
        <div
          className={[
            'flex size-10 shrink-0 items-center',
            'justify-center rounded-[9px] border',
            emphasized
              ? [
                  'border-[var(--ds-border-gold)]',
                  'bg-[var(--ds-amber-08)]',
                ].join(' ')
              : [
                  'border-[var(--ds-border-soft)]',
                  'bg-[var(--ds-white-03)]',
                ].join(' '),
          ].join(' ')}
        >
          <Icon
            size={19}
            strokeWidth={1.6}
            className={
              emphasized ? 'text-[var(--ds-gold)]' : 'text-[var(--ds-muted)]'
            }
          />
        </div>

        <div className={'min-w-0 flex-1'}>
          <p
            className={
              'text-[8px] font-semibold uppercase ' +
              'tracking-[0.15em] text-[var(--ds-muted)]'
            }
          >
            {label}
          </p>

          <p
            className={[
              'mt-1.5 truncate font-serif text-[22px]',
              'font-medium leading-none tracking-[-0.02em]',
              emphasized
                ? 'text-[var(--ds-soft-gold)]'
                : 'text-[var(--ds-cream)]',
            ].join(' ')}
          >
            {value}
          </p>
        </div>
      </div>

      <p
        className={
          'relative mt-3 line-clamp-2 text-[9px] ' +
          'leading-[1.55] text-[var(--ds-muted)]'
        }
      >
        {description}
      </p>

      <div
        aria-hidden="true"
        className={[
          'absolute inset-x-0 bottom-0 h-px',
          'opacity-0 transition-opacity duration-200',
          'group-hover:opacity-100',
          emphasized
            ? [
                'bg-gradient-to-r',
                'from-transparent',
                'via-[var(--ds-border-gold)]',
                'to-transparent',
              ].join(' ')
            : [
                'bg-gradient-to-r',
                'from-transparent',
                'via-[var(--ds-border-soft)]',
                'to-transparent',
              ].join(' '),
        ].join(' ')}
      />
    </article>
  );
});
