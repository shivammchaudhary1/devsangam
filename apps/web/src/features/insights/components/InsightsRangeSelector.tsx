import type { InsightsRange } from '@devsangam/types';
import { CalendarDays } from 'lucide-react';
import { memo } from 'react';

const INSIGHTS_RANGES: readonly {
  value: InsightsRange;
  label: string;
}[] = [
  {
    value: '7d',
    label: '7 Days',
  },
  {
    value: '30d',
    label: '30 Days',
  },
  {
    value: '90d',
    label: '90 Days',
  },
  {
    value: 'all',
    label: 'All Time',
  },
];

type InsightsRangeSelectorProps = {
  value: InsightsRange;

  onChange: (range: InsightsRange) => void;
};

export const InsightsRangeSelector = memo(function InsightsRangeSelector({
  value,
  onChange,
}: InsightsRangeSelectorProps) {
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-[9px] border border-[var(--ds-border-soft)] bg-[var(--ds-elevated)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.018)]">
      <div className="hidden size-7 shrink-0 items-center justify-center text-[var(--ds-muted)] sm:flex">
        <CalendarDays size={13} strokeWidth={1.6} />
      </div>

      {INSIGHTS_RANGES.map((range) => {
        const isActive = range.value === value;

        return (
          <button
            key={range.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(range.value)}
            className={[
              'shrink-0 rounded-[6px] px-3 py-2 text-[9px] font-semibold transition-all duration-150',
              isActive
                ? [
                    'bg-[#d89a35]/[0.095]',
                    'text-[var(--ds-soft-gold)]',
                    'shadow-[inset_0_0_0_1px_rgba(216,154,53,0.18)]',
                  ].join(' ')
                : [
                    'text-[var(--ds-muted)]',
                    'hover:bg-[var(--ds-white-03)]',
                    'hover:text-[#b8bec6]',
                  ].join(' '),
            ].join(' ')}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
});
