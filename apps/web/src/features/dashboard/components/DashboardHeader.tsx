import { formatDashboardDate } from '../utils/dashboard-formatters';
import { CalendarDays, Flame, Sparkles } from 'lucide-react';

type DesktopDashboardHeaderProps = {
  firstName: string;
  timezone: string;
};

export function DesktopDashboardHeader({
  firstName,
  timezone,
}: DesktopDashboardHeaderProps) {
  return (
    <header className="hidden items-start justify-between border-b border-[var(--ds-border-soft)] pb-5 md:flex">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles
            size={14}
            strokeWidth={1.7}
            className="text-[var(--ds-amber)]"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gold)]">
            Your Sacred Space
          </p>
        </div>

        <h1 className="mt-2 font-serif text-[25px] font-medium tracking-[0.01em] text-[var(--ds-cream)] lg:text-[28px]">
          Namaste, {firstName}
        </h1>

        <p className="mt-2 text-[12px] text-[var(--ds-muted)]">
          Let&apos;s continue your sacred practice.
        </p>
      </div>

      <div className="flex h-9 items-center gap-2 rounded-[8px] border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] px-3.5 shadow-[var(--ds-shadow-card)]">
        <CalendarDays
          size={13}
          strokeWidth={1.6}
          className="text-[var(--ds-muted)]"
        />

        <span className="text-[10px] font-medium text-[var(--ds-text)]">
          {formatDashboardDate(new Date(), timezone)}
        </span>
      </div>
    </header>
  );
}

type MobileStreakBarProps = {
  currentStreak: number;
  unavailable: boolean;
};

export function MobileStreakBar({
  currentStreak,
  unavailable,
}: MobileStreakBarProps) {
  return (
    <section className="flex min-h-[48px] items-center justify-between rounded-[9px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] px-4 shadow-[var(--ds-shadow-card)] md:hidden">
      <div className="flex items-center gap-2.5">
        <Flame
          size={17}
          strokeWidth={1.7}
          className="text-[var(--ds-amber-bright)]"
        />

        <span className="font-serif text-[19px] text-[var(--ds-soft-gold)]">
          {unavailable ? '—' : currentStreak}
        </span>

        <span className="text-[11px] text-[var(--ds-muted)]">Day Streak</span>
      </div>

      <span className="text-[10px] font-medium text-[var(--ds-gold)]">
        Keep it going!
      </span>
    </section>
  );
}
