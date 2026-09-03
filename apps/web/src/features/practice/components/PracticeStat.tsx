import { memo } from 'react';

type PracticeStatProps = {
  label: string;
  value: string;
};

export const PracticeStat = memo(function PracticeStat({
  label,
  value,
}: PracticeStatProps) {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[var(--ds-border-soft)] bg-[linear-gradient(145deg,rgba(255,255,255,0.018),transparent_42%),#090f17] px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.015)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[20%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(216,154,53,0.14),transparent)]"
      />

      <p className="relative text-[7px] font-semibold uppercase tracking-[0.14em] text-[#5f6772]">
        {label}
      </p>

      <p className="relative mt-1.5 truncate font-serif text-[15px] font-medium text-[var(--ds-soft-gold)] sm:text-[17px]">
        {value}
      </p>
    </div>
  );
});
