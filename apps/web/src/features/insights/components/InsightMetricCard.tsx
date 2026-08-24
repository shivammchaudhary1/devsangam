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
        'relative overflow-hidden rounded-2xl border p-4 sm:p-5',
        emphasized
          ? [
              'border-amber-400/25',
              'bg-[linear-gradient(145deg,rgba(245,158,11,0.10),rgba(9,18,30,0.96)_48%)]',
              'shadow-[0_12px_36px_rgba(0,0,0,0.16)]',
            ].join(' ')
          : ['border-white/[0.07]', 'bg-[#09121e]'].join(' '),
      ].join(' ')}
    >
      {emphasized ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-amber-400/[0.08] blur-3xl"
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p
            className={[
              'mt-3 font-serif text-2xl font-medium sm:text-3xl',
              emphasized ? 'text-[#edc864]' : 'text-slate-100',
            ].join(' ')}
          >
            {value}
          </p>
        </div>

        <div
          className={[
            'flex size-9 shrink-0 items-center justify-center rounded-xl border',
            emphasized
              ? 'border-amber-400/20 bg-amber-400/[0.09]'
              : 'border-white/[0.07] bg-white/[0.025]',
          ].join(' ')}
        >
          <Icon
            size={17}
            strokeWidth={1.7}
            className={emphasized ? 'text-amber-300' : 'text-slate-500'}
          />
        </div>
      </div>

      <p className="relative mt-3 text-[11px] leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
});
