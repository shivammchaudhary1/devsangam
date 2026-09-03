import { SettingsCard } from './SettingsCard';
import type {
  ResolvedTheme,
  ThemePreference,
} from '@/features/theme/types/theme.types';
import { Check, Loader2, Monitor, Moon, Palette, Sun } from 'lucide-react';
import type { ReactNode } from 'react';

type AppearanceSettingsProps = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  pending: boolean;
  onThemeChange: (theme: ThemePreference) => void | Promise<void>;
};

type ThemeOption = {
  value: ThemePreference;
  label: string;
  description: string;
  icon: ReactNode;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'dark',

    label: 'Dark',

    description: 'Always use the dark DevSangam theme.',

    icon: <Moon size={17} strokeWidth={1.7} />,
  },

  {
    value: 'light',

    label: 'Light',

    description: 'Use the warm light DevSangam theme.',

    icon: <Sun size={17} strokeWidth={1.7} />,
  },

  {
    value: 'system',

    label: 'System',

    description: 'Follow this device automatically.',

    icon: <Monitor size={17} strokeWidth={1.7} />,
  },
];

export function AppearanceSettings({
  themePreference,
  resolvedTheme,
  pending,
  onThemeChange,
}: AppearanceSettingsProps) {
  const resolvedLabel = resolvedTheme === 'dark' ? 'Dark' : 'Light';

  return (
    <SettingsCard
      icon={<Palette size={16} strokeWidth={1.7} />}
      title="Appearance"
      description="Choose how DevSangam looks across your account and devices."
    >
      <div className="p-4">
        <div
          role="radiogroup"
          aria-label="Appearance"
          className="grid grid-cols-3 gap-2"
        >
          {THEME_OPTIONS.map((option) => {
            const selected = option.value === themePreference;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={pending}
                onClick={() => {
                  if (!selected) {
                    void onThemeChange(option.value);
                  }
                }}
                className={[
                  'relative flex min-h-[118px] flex-col items-center',
                  'justify-center rounded-[9px] border px-2.5 py-3',
                  'text-center transition-all duration-200',
                  selected
                    ? [
                        'border-[var(--ds-border-gold)]',
                        'bg-[var(--ds-amber-08)]',
                        'shadow-[var(--ds-shadow-gold-inset)]',
                      ].join(' ')
                    : [
                        'border-[var(--ds-border-soft)]',
                        'bg-[var(--ds-white-02)]',
                        'hover:border-[var(--ds-border-gold)]',
                        'hover:bg-[var(--ds-amber-05)]',
                      ].join(' '),
                  pending ? 'cursor-not-allowed opacity-60' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex size-8 items-center justify-center',
                    'rounded-full border transition',
                    selected
                      ? [
                          'border-[var(--ds-border-gold)]',
                          'bg-[var(--ds-amber-10)]',
                          'text-[var(--ds-gold)]',
                        ].join(' ')
                      : [
                          'border-[var(--ds-border-soft)]',
                          'text-[var(--ds-muted)]',
                        ].join(' '),
                  ].join(' ')}
                >
                  {option.icon}
                </span>

                <span
                  className={[
                    'mt-2 text-[11px] font-semibold',
                    selected
                      ? 'text-[var(--ds-soft-gold)]'
                      : 'text-[var(--ds-text)]',
                  ].join(' ')}
                >
                  {option.label}
                </span>

                <span
                  className={
                    'mt-1 text-[9px] leading-4 ' + 'text-[var(--ds-muted-soft)]'
                  }
                >
                  {option.description}
                </span>

                {selected ? (
                  <span
                    className={
                      'absolute right-2 top-2 flex size-4 ' +
                      'items-center justify-center rounded-full ' +
                      'bg-[var(--ds-gold)] text-[var(--ds-night)]'
                    }
                  >
                    {pending ? (
                      <Loader2 size={9} className="animate-spin" />
                    ) : (
                      <Check size={9} strokeWidth={2.4} />
                    )}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div
          className={
            'mt-4 rounded-[8px] border ' +
            'border-[var(--ds-border-soft)] ' +
            'bg-[var(--ds-white-02)] px-3 py-2.5'
          }
        >
          <p className={'text-[10px] leading-4 ' + 'text-[var(--ds-muted)]'}>
            {themePreference === 'system'
              ? `Following your device. DevSangam is currently using ${resolvedLabel} mode.`
              : `${resolvedLabel} mode is active.`}
          </p>
        </div>
      </div>
    </SettingsCard>
  );
}
