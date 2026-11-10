'use client';

import { PUBLIC_ROUTES } from '../constants/public-routes';
import { Link } from '@/lib/navigation';
import { ArrowUpRight, BookOpenCheck, CalendarHeart, Orbit, ShieldCheck } from 'lucide-react';

const categories = [
  {
    number: '01',
    title: 'Digital mantra PDFs',
    subtitle: 'Read, reflect & keep',
    description: 'Downloadable mantra meanings, chanting guides and devotional resources. Paid files become available in your private library after verified checkout.',
    icon: BookOpenCheck,
    status: 'Explore published resources',
    href: '#digital-pdfs',
    available: true,
  },
  {
    number: '02',
    title: 'E-Pooja bookings',
    subtitle: 'A future guided offering',
    description: 'We are preparing a space to explore scheduled e-pooja experiences. Booking, priests, scheduling and payments are not available yet.',
    icon: CalendarHeart,
    status: 'Coming soon',
    available: false,
  },
  {
    number: '03',
    title: 'Astro & spiritual guidance',
    subtitle: 'Discover & learn',
    description: 'Explore Vedic birth-chart basics today. Additional guided resources may be added later; personalized paid consultations are not currently offered.',
    icon: Orbit,
    status: 'Explore Astro',
    href: PUBLIC_ROUTES.astro,
    available: true,
  },
] as const;

type ProductCategory = (typeof categories)[number];

function CategoryCard({ category, onLanding }: { category: ProductCategory; onLanding: boolean }) {
  const Icon = category.icon;
  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] p-6 transition-colors hover:border-[var(--ds-border-gold)] sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 size-40 rounded-full border border-[var(--ds-border-gold)] opacity-40" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-soft-gold)]"><Icon size={22} strokeWidth={1.65} /></span>
          <span className="font-serif text-2xl text-[var(--ds-gold)] opacity-60">{category.number}</span>
        </div>
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--ds-gold)]">{category.subtitle}</p>
        <h3 className="mt-3 font-serif text-[23px] leading-snug text-[var(--ds-cream)]">{category.title}</h3>
        <p className="mt-4 text-[12px] leading-7 text-[var(--ds-muted)]">{category.description}</p>
        <div className="mt-auto pt-7">
          {'href' in category && category.href ? (
            <Link
              to={onLanding && category.href === '#digital-pdfs' ? PUBLIC_ROUTES.products : category.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-4 text-[11px] font-semibold text-[var(--ds-soft-gold)] transition hover:bg-[var(--ds-amber-10)]"
            >
              {category.status}<ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--ds-border-soft)] px-4 text-[11px] text-[var(--ds-muted)]">
              <ShieldCheck size={15} aria-hidden="true" /> {category.status}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCategories({ onLanding = false }: { onLanding?: boolean }) {
  return (
    <section aria-labelledby="product-categories-title" className={onLanding ? 'mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20' : 'mb-12'}>
      <div className="mb-8 max-w-2xl">
        <p className="ds-eyebrow">Devotional products & experiences</p>
        <h2 id="product-categories-title" className="mt-3 font-serif text-3xl text-[var(--ds-cream)] sm:text-4xl">
          More ways to deepen your practice
        </h2>
        <p className="mt-4 text-[13px] leading-7 text-[var(--ds-muted)]">
          Start with downloadable devotional resources, discover the Astro experience,
          and see what we are planning next.
        </p>
      </div>
      <div className="grid items-stretch gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard category={category} onLanding={onLanding} key={category.number} />
        ))}
      </div>
      {onLanding && (
        <p className="mt-5 text-[11px] leading-6 text-[var(--ds-muted)]">
          E-Pooja and paid guidance are previews only. Booking and payments for these services are not live.
        </p>
      )}
    </section>
  );
}
