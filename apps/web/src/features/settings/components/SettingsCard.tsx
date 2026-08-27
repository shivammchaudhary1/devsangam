import type { ReactNode } from 'react';

type SettingsCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsCard({
  icon,
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <article className="overflow-hidden rounded-[11px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="flex items-start gap-3 border-b border-white/[0.055] px-4 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] text-[var(--ds-gold)]">
          {icon}
        </div>

        <div>
          <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
            {title}
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-[var(--ds-muted-soft)]">
            {description}
          </p>
        </div>
      </div>

      {children}
    </article>
  );
}

type SettingsRowProps = {
  label: string;
  description: string;
  children: ReactNode;
  last?: boolean;
};

export function SettingsRow({
  label,
  description,
  children,
  last = false,
}: SettingsRowProps) {
  return (
    <div
      className={[
        'flex min-h-[68px] items-center justify-between gap-4 px-4 py-3',
        last
          ? ''
          : 'border-b border-white/[0.045]',
      ].join(' ')}
    >
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[var(--ds-text)]">
          {label}
        </p>

        <p className="mt-1 max-w-[350px] text-[10px] leading-4 text-[var(--ds-muted-soft)]">
          {description}
        </p>
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}