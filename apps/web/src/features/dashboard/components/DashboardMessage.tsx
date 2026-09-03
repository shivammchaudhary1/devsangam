import type { ReactNode } from 'react';

type DashboardMessageProps = {
  children: ReactNode;
};

export function DashboardMessage({ children }: DashboardMessageProps) {
  return (
    <div className="rounded-[8px] border border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] px-4 py-6 text-center">
      <p className="text-[11px] leading-5 text-[var(--ds-muted)]">{children}</p>
    </div>
  );
}
