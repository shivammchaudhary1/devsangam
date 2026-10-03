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
    <div>
      <header className="mb-10 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--ds-gold)]">
          A companion for your Sadhana
        </p>
        <h1 className="text-3xl leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-8 text-muted-foreground">
          {intro}
        </p>
      </header>
      {children}
    </div>
  );
}
