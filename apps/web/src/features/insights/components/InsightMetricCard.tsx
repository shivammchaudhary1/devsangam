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
        'group relative overflow-hidden rounded-[11px] border px-4 py-4',
        'transition-all duration-200',
        emphasized
          ? [
              'border-[#d89a35]/24',
              'bg-[linear-gradient(145deg,rgba(216,154,53,0.085),rgba(13,19,28,0.98)_46%,rgba(10,16,24,1))]',
              'shadow-[0_13px_30px_rgba(0,0,0,0.22),0_0_22px_rgba(216,154,53,0.035)]',
            ].join(' ')
          : [
              'border-white/[0.075]',
              'bg-[linear-gradient(145deg,rgba(255,255,255,0.024),transparent_40%),#0d131c]',
              'shadow-[0_13px_30px_rgba(0,0,0,0.18)]',
            ].join(' '),
      ].join(' ')}
    >
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute -right-10 -top-12 size-28 rounded-full blur-3xl',
          emphasized ? 'bg-[#d89a35]/[0.075]' : 'bg-white/[0.018]',
        ].join(' ')}
      />

      <div className="relative flex items-center gap-3.5">
        <div
          className={[
            'flex size-10 shrink-0 items-center justify-center rounded-[9px] border',
            emphasized
              ? 'border-[#d89a35]/20 bg-[#d89a35]/[0.065]'
              : 'border-white/[0.065] bg-white/[0.022]',
          ].join(' ')}
        >
          <Icon
            size={19}
            strokeWidth={1.6}
            className={emphasized ? 'text-[#dda13e]' : 'text-[#8a929d]'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#6f7782]">
            {label}
          </p>

          <p
            className={[
              'mt-1.5 truncate font-serif text-[22px] font-medium leading-none tracking-[-0.02em]',
              emphasized ? 'text-[#efc875]' : 'text-[#e7e0d6]',
            ].join(' ')}
          >
            {value}
          </p>
        </div>
      </div>

      <p className="relative mt-3 line-clamp-2 text-[9px] leading-[1.55] text-[#69717c]">
        {description}
      </p>

      <div
        aria-hidden="true"
        className={[
          'absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100',
          emphasized
            ? 'bg-[linear-gradient(90deg,transparent,rgba(216,154,53,0.42),transparent)]'
            : 'bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.18),transparent)]',
        ].join(' ')}
      />
    </article>
  );
});
