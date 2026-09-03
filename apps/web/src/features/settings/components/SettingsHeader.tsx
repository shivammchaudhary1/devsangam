import { Settings } from 'lucide-react';

export function SettingsHeader() {
  return (
    <header className="border-b border-[var(--ds-border-soft)] pb-5">
      <div className="flex items-center gap-2">
        <Settings
          size={14}
          strokeWidth={1.7}
          className="text-[var(--ds-amber)]"
        />

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gold)]">
          Preferences
        </p>
      </div>

      <h1 className="mt-2 font-serif text-[25px] font-medium tracking-[0.01em] text-[var(--ds-cream)] sm:text-[28px]">
        Settings
      </h1>

      <p className="mt-2 text-[12px] leading-5 text-[var(--ds-muted)]">
        Configure how DevSangam supports your daily Sadhana.
      </p>
    </header>
  );
}