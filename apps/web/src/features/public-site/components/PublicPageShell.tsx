'use client';

import heroBackdrop from '@/assets/Images/background-image.webp';
import { Link } from '@/lib/navigation';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

type PublicPageShellProps = {
  title: string;
  intro: string;
  children: ReactNode;
  eyebrow?: string;
  highlight?: string;
};

/**
 * Shared, image-led public-page structure. The site's PublicLayout owns the
 * global footer; this component does not duplicate it or alter the theme.
 */
export function PublicPageShell({
  title,
  intro,
  children,
  eyebrow = 'Explore DevSangam',
  highlight,
}: PublicPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-10">
      <header className="relative isolate mb-10 min-h-[300px] overflow-hidden rounded-[24px] border border-[var(--ds-border-gold)] bg-[var(--ds-sidebar)] shadow-[var(--ds-shadow-card)] sm:min-h-[355px]">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={heroBackdrop}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--ds-sidebar)] via-[var(--ds-sidebar)]/90 to-[var(--ds-sidebar)]/30" />
          <div className="absolute -right-24 -top-32 size-80 rounded-full border border-[var(--ds-border-gold)] opacity-50" />
          <div className="absolute -right-12 -top-16 size-56 rounded-full border border-[var(--ds-border-gold)] opacity-40" />
          <div className="absolute bottom-0 right-0 h-32 w-72 bg-[var(--ds-amber-08)] blur-[70px]" />
        </div>
        <div className="relative z-10 flex min-h-[300px] flex-col justify-center px-6 py-9 sm:min-h-[355px] sm:px-10 sm:py-12 lg:px-14">
          <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-[11px] text-[var(--ds-muted)]">
            <Link to="/" className="transition hover:text-[var(--ds-soft-gold)]">Home</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page" className="text-[var(--ds-soft-gold)]">{title}</span>
          </nav>
          <p className="ds-eyebrow flex items-center gap-2"><Sparkles size={14} aria-hidden="true" />{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.1rem,4.5vw,3.6rem)] leading-[1.1] tracking-tight text-[var(--ds-cream)]">
            {title}{highlight ? <span className="text-[var(--ds-soft-gold)]"> {highlight}</span> : null}
          </h1>
          <p className="mt-5 max-w-[670px] text-[13px] leading-7 text-[var(--ds-text)] sm:text-[15px] sm:leading-8">{intro}</p>
        </div>
      </header>
      {children}
    </div>
  );
}

export function PublicBottomCTA({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <section className="relative mt-14 overflow-hidden rounded-[22px] border border-[var(--ds-border-gold)] bg-[var(--ds-gradient-panel)] p-7 sm:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 size-60 rounded-full bg-[var(--ds-amber-10)] blur-3xl" />
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="ds-eyebrow">Continue your journey</p>
          <h2 className="mt-3 font-serif text-2xl text-[var(--ds-cream)] sm:text-3xl">{title}</h2>
          <p className="mt-3 text-[12px] leading-7 text-[var(--ds-muted)] sm:text-sm">{description}</p>
        </div>
        <Link to={href} className="ds-gold-button inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-5 text-[12px] font-semibold">
          {label}<ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
