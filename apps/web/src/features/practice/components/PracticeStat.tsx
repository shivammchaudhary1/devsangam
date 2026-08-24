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
    <div className="rounded-xl border border-white/[0.07] bg-[#09121e] px-2 py-3 text-center">
      <p className="text-[8px] uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 font-serif text-base text-[#e8c86f] sm:text-lg">
        {value}
      </p>
    </div>
  );
});
