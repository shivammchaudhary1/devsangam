'use client';

import { PublicBottomCTA, PublicPageShell } from '../components/PublicPageShell';
import { PUBLIC_ROUTES } from '../constants/public-routes';
import { Link } from '@/lib/navigation';
import { ArrowUpRight, BookOpen, HeartHandshake, ShieldCheck, Sparkles, WifiOff } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: HeartHandshake,
    title: 'A quieter daily ritual',
    description: 'Make space for mindful mantra chanting without feeds, leaderboards or pressure to perform.',
  },
  {
    icon: BookOpen,
    title: 'Meaning alongside practice',
    description: 'Explore Sanskrit text, transliteration, meaning and personal favorites in your mantra library.',
  },
  {
    icon: WifiOff,
    title: 'Continue at your pace',
    description: 'Prepared practice sessions can continue offline and synchronize when your connection returns.',
  },
  {
    icon: ShieldCheck,
    title: 'Your journey belongs to you',
    description: 'Personal counts, goals, insights and history stay attached to your authenticated account.',
  },
] as const;

export function AboutPage() {
  return (
    <PublicPageShell
      title="About DevSangam"
      eyebrow="Our purpose · Your practice"
      intro="An intentional digital companion for Japamala, mantra Sadhana, personal reflection and a growing collection of devotional resources."
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
        <section className="max-w-2xl">
          <p className="ds-eyebrow">A meaningful beginning</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-[var(--ds-cream)] sm:text-4xl">
            Technology should support devotion, not distract from it.
          </h2>
          <p className="mt-5 text-[13px] leading-8 text-[var(--ds-muted)]">
            DevSangam brings together the simplicity of a digital mala counter and the continuity of a
            personal practice diary. Set a mantra target, count each repetition, pause when you need to,
            and return to your practice history whenever you wish.
          </p>
          <p className="mt-4 text-[13px] leading-8 text-[var(--ds-muted)]">
            Alongside these tools, we offer published devotional reading resources and a basic Vedic
            astrology experience for cultural exploration. Your practice is personal; our role is to
            make the tools easier to use.
          </p>
          <Link
            to={PUBLIC_ROUTES.howItWorks}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold text-[var(--ds-soft-gold)] transition hover:underline"
          >
            See how DevSangam works <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <aside className="ds-panel relative overflow-hidden p-7 sm:p-9">
          <div aria-hidden="true" className="absolute -right-10 -top-10 size-40 rounded-full border border-[var(--ds-border-gold)] opacity-50" />
          <div className="relative z-10">
            <span className="flex size-12 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-soft-gold)]">
              <Sparkles size={22} strokeWidth={1.5} />
            </span>
            <p className="ds-eyebrow mt-7">The guiding thought</p>
            <p className="mt-4 font-serif text-[28px] leading-snug text-[var(--ds-cream)] sm:text-[34px]">
              One mantra. One moment. A practice you can return to.
            </p>
            <div className="ds-gold-line my-7 opacity-50" />
            <p className="text-[12px] leading-7 text-[var(--ds-muted)]">
              Chant. Connect. Transform. A steady rhythm begins with a single intentional moment.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-16" aria-labelledby="about-principles">
        <p className="ds-eyebrow">Designed with care</p>
        <h2 id="about-principles" className="mt-3 font-serif text-3xl text-[var(--ds-cream)] sm:text-4xl">
          What makes the experience different
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="ds-panel p-6 sm:p-7">
              <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] text-[var(--ds-gold)]">
                <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif text-xl text-[var(--ds-cream)]">{title}</h3>
              <p className="mt-3 text-[12px] leading-7 text-[var(--ds-muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-[22px] border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-6 sm:p-9">
        <p className="ds-eyebrow">Discover more</p>
        <h2 className="mt-3 font-serif text-2xl text-[var(--ds-cream)] sm:text-3xl">A connected devotional space</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-serif text-lg text-[var(--ds-soft-gold)]">Digital resources</h3>
            <p className="mt-2 text-[12px] leading-7 text-[var(--ds-muted)]">
              Browse available mantra guides and devotional PDFs. Premium files use verified account access.
            </p>
            <Link to={PUBLIC_ROUTES.products} className="mt-3 inline-flex min-h-10 items-center gap-2 text-[11px] font-semibold text-[var(--ds-soft-gold)]">
              Explore Products <ArrowUpRight size={14} />
            </Link>
          </div>
          <div>
            <h3 className="font-serif text-lg text-[var(--ds-soft-gold)]">Vedic astrology</h3>
            <p className="mt-2 text-[12px] leading-7 text-[var(--ds-muted)]">
              Explore Rashi, Nakshatra and traditional chart placements with a free account
              and your birth details.
            </p>
            <Link to={PUBLIC_ROUTES.astro} className="mt-3 inline-flex min-h-10 items-center gap-2 text-[11px] font-semibold text-[var(--ds-soft-gold)]">
              Explore Astro <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <PublicBottomCTA
        title="Begin with a moment of practice"
        description="Create a free account and find a calm rhythm with digital Japamala, personal goals and insights."
        href="/auth/register"
        label="Begin your Sadhana"
      />
    </PublicPageShell>
  );
}
