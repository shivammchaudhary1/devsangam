import { Flame } from 'lucide-react';

type ProfileStreakCardProps = {
  currentStreak: number;
  longestStreak: number;
  unavailable: boolean;
};

export function ProfileStreakCard({
  currentStreak,
  longestStreak,
  unavailable,
}: ProfileStreakCardProps) {
  return (
    <article className="rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] p-5 shadow-[var(--ds-shadow-card)]">
      <p className="text-[11px] font-medium text-[var(--ds-muted)]">
        Your Streak
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Flame
          size={26}
          strokeWidth={1.7}
          className="text-[var(--ds-amber-bright)]"
        />

        <span className="font-serif text-[31px] text-[var(--ds-soft-gold)]">
          {unavailable ? '—' : currentStreak}
        </span>

        <span className="text-[11px] text-[var(--ds-muted)]">days</span>
      </div>

      <div className="mt-5 flex justify-between border-t border-[var(--ds-border-soft)] pt-4 text-[11px]">
        <span className="text-[var(--ds-muted-soft)]">Longest streak</span>

        <span className="text-[var(--ds-gold)]">
          {unavailable ? '—' : `${longestStreak} days`}
        </span>
      </div>
    </article>
  );
}
