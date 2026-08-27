import type { ReactNode } from 'react';

type DashboardMessageProps = {
  children: ReactNode;
};

export function DashboardMessage({ children }: DashboardMessageProps) {
  return (
    <div className="rounded-[8px] border border-white/[0.05] bg-white/[0.015] px-4 py-6 text-center">
      <p className="text-[11px] leading-5 text-[var(--ds-muted)]">{children}</p>
    </div>
  );
}
