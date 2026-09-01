import { APP_ROUTES } from '@/app/constants/routes.constants';
import { Settings, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export function ProfileHeader() {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-white/[0.055] pb-5">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles
            size={14}
            strokeWidth={1.7}
            className="text-[var(--ds-amber)]"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gold)]">
            Your Space
          </p>
        </div>

        <h1 className="mt-2 font-serif text-[25px] font-medium text-[var(--ds-cream)] sm:text-[28px]">
          Profile
        </h1>

        <p className="mt-2 text-[12px] leading-5 text-[var(--ds-muted)]">
          Your identity and Sadhana journey.
        </p>
      </div>

      <Link
        to={APP_ROUTES.settings}
        className="flex h-9 shrink-0 items-center gap-2 rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 text-[11px] font-medium text-[var(--ds-soft-gold)] transition hover:bg-[var(--ds-amber-08)]"
      >
        <Settings size={13} strokeWidth={1.7} />
        Settings
      </Link>
    </header>
  );
}
