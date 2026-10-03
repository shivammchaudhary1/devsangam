import { type ReactNode, useEffect } from 'react';

type PublicPageShellProps = {
  title: string;
  intro: string;
  children: ReactNode;
};

export function PublicPageShell({
  title,
  intro,
  children,
}: PublicPageShellProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | DevSangam`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
      <header className="relative mb-10 overflow-hidden rounded-[22px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel)] px-6 py-8 shadow-[var(--ds-shadow-card)] sm:px-9 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[var(--ds-amber-08)] blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <p className="ds-eyebrow mb-4">A companion for your Sadhana</p>
          <h1 className="text-3xl leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ds-muted)] sm:text-base sm:leading-8">{intro}</p>
        </div>
      </header>
      {children}
    </div>
  );
}
