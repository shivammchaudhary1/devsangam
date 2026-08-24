import type { InsightsRange } from '@devsangam/types';
import { memo } from 'react';

const INSIGHTS_RANGES: readonly {
  value: InsightsRange;
  label: string;
}[] = [
  {
    value: '7d',
    label: '7D',
  },
  {
    value: '30d',
    label: '30D',
  },
  {
    value: '90d',
    label: '90D',
  },
  {
    value: 'all',
    label: 'All',
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
    <div className="inline-flex rounded-xl border border-white/[0.08] bg-[#09121e] p-1">
      {INSIGHTS_RANGES.map((range) => {
        const isActive = range.value === value;

        return (
          <button
            key={range.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(range.value)}
            className={[
              'min-w-12 rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition sm:min-w-14',
              isActive
                ? [
                    'bg-amber-400/[0.13]',
                    'text-amber-200',
                    'shadow-[inset_0_0_0_1px_rgba(251,191,36,0.18)]',
                  ].join(' ')
                : [
                    'text-slate-500',
                    'hover:bg-white/[0.04]',
                    'hover:text-slate-300',
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
