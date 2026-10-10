'use client';

import { PublicCTA } from '../components/PublicCTA';
import { PUBLIC_ROUTES } from '../constants/public-routes';
import { buttonVariants } from '@/components/ui/button-variants';
import { Link } from '@/lib/navigation';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  CircleDot,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Digital Japamala',
    text: 'Choose a target, count at your own rhythm, and pause or resume without turning Sadhana into a noisy app experience.',
    icon: CircleDot,
    accent: 'Practice',
  },
  {
    title: 'Mantra library',
    text: 'Explore Sanskrit, transliteration, meaning and practice context while keeping your favorites close.',
    icon: BookOpen,
    accent: 'Discover',
  },
  {
    title: 'Personal insights',
    text: 'Review your practice history, activity and streaks from a private account dashboard.',
    icon: BarChart3,
    accent: 'Reflect',
  },
  {
    title: 'Offline continuity',
    text: 'A prepared practice session can continue locally and synchronize again when connectivity returns.',
    icon: WifiOff,
    accent: 'Continue',
  },
  {
    title: 'Gentle reminders',
    text: 'Enable optional device reminders from Settings when your browser supports notifications.',
    icon: Bell,
    accent: 'Return',
  },
] as const;

const STEPS = [
  {
    title: 'Choose your mantra',
    text: 'Browse the library and begin with a mantra that fits your practice.',
  },
  {
    title: 'Set your rhythm',
    text: 'Select a chant target, begin your digital mala and continue without distraction.',
  },
  {
    title: 'Reflect over time',
    text: 'Return to your history and insights to understand the practice you have actually completed.',
  },
] as const;

const HERO_BADGES = [
  { label: 'Focused practice', icon: CircleDot },
  { label: 'Installable PWA', icon: Sparkles },
  { label: 'Account-based history', icon: ShieldCheck },
] as const;

const LIBRARY_SECURITY = [
  {
    title: 'Private PDF delivery',
    text: 'Paid files are not exposed as permanent public URLs.',
    icon: Lock,
  },
  {
    title: 'Verified access',
    text: 'Server-side payment verification creates the account entitlement.',
    icon: ShieldCheck,
  },
  {
    title: 'Clear ownership',
    text: 'Purchased resources are collected in your personal library.',
    icon: CheckCircle2,
  },
] as const;

export function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--ds-border-soft)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 size-[520px] -translate-x-1/2 rounded-full bg-[var(--ds-amber-08)] blur-[110px]"
        />
        <div className="relative mx-auto grid min-h-[calc(100dvh-72px)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-gold)]">
              <Sparkles size={12} />
              A quieter digital space for daily practice
            </div>
            <h1 className="max-w-3xl text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Make space for daily Sadhana
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--ds-muted)] sm:text-lg">
              Mantras, a focused digital Japamala, personal practice history,
              offline continuity and a growing devotional library—kept together
              in one calm DevSangam experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PublicCTA />
              <Link
                to={PUBLIC_ROUTES.howItWorks}
                className={`${buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                })} min-h-12 rounded-xl`}
              >
                See how it works
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[10px] text-[var(--ds-muted)]">
              {HERO_BADGES.map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon size={13} className="text-[var(--ds-gold)]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-full bg-[var(--ds-amber-10)] blur-3xl"
            />
            <div className="ds-panel relative overflow-visible p-4 sm:p-6">
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.16em] text-[var(--ds-gold)]">
                      A glimpse of the experience
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--ds-text)]">
                      Today&apos;s Sadhana
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--ds-border-soft)] px-3 py-1.5 text-[8px] text-[var(--ds-muted)]">
                    Focus mode
                  </span>
                </div>

                <div className="rounded-[20px] border border-[var(--ds-border-gold)] bg-[var(--ds-night)] p-5 sm:p-7">
                  <div className="mx-auto flex aspect-square max-w-[270px] items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-03)] shadow-[var(--ds-shadow-gold-strong)]">
                    <div className="flex size-[78%] flex-col items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-white-02)]">
                      <span className="font-devanagari text-6xl text-[var(--ds-soft-gold)] sm:text-7xl">
                        ॐ
                      </span>
                      <span className="mt-3 text-[8px] uppercase tracking-[0.18em] text-[var(--ds-muted)]">
                        One chant at a time
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {[
                      { value: '108', label: 'Target' },
                      { value: 'Pause', label: 'Anytime' },
                      { value: 'Sync', label: 'On return' },
                    ].map(({ value, label }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3 text-center"
                      >
                        <p className="ds-stat-value text-sm sm:text-base">
                          {value}
                        </p>
                        <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-[var(--ds-muted)]">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-gold)]">
                    <WifiOff size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--ds-text)]">
                      Prepared sessions can continue offline
                    </p>
                    <p className="mt-1 text-[8px] text-[var(--ds-muted)]">
                      Pending local practice syncs when connectivity returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="ds-eyebrow mb-3">Built around the practice</p>
          <h2 className="text-3xl sm:text-4xl">
            Useful tools, without turning devotion into a dashboard contest
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--ds-muted)]">
            DevSangam keeps the interface intentional: enough structure to help
            you return consistently, without a social feed or competitive
            leaderboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map(({ title, text, icon: Icon, accent }, index) => (
            <article
              key={title}
              className={`ds-panel p-6 ${
                index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-gold)]">
                    <Icon size={20} />
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--ds-muted-soft)]">
                    {accent}
                  </span>
                </div>
                <h3 className="mt-6 text-xl">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ds-muted)]">
                  {text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--ds-border-soft)] bg-[var(--ds-white-02)]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="ds-eyebrow mb-3">How it fits your day</p>
              <h2 className="text-3xl sm:text-4xl">
                A simple rhythm from intention to reflection
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--ds-muted)]">
                The product is designed around a small number of clear steps, so
                your attention stays on the practice rather than the interface.
              </p>
              <Link
                to={PUBLIC_ROUTES.howItWorks}
                className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--ds-soft-gold)]"
              >
                View the complete flow
                <ArrowRight size={14} />
              </Link>
            </div>
            <ol className="space-y-3">
              {STEPS.map(({ title, text }, index) => (
                <li
                  key={title}
                  className="ds-panel flex gap-4 p-5 sm:items-center"
                >
                  <span className="ds-stat-value flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm">{title}</h3>
                    <p className="mt-2 text-[11px] leading-6 text-[var(--ds-muted)]">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="digital-library"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 lg:py-20"
      >
        <div className="ds-panel overflow-visible p-6 sm:p-9 lg:p-10">
          <div className="relative z-10 grid gap-9 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-gold)]">
                <FileText size={12} />
                Digital devotional library
              </div>
              <h2 className="text-3xl sm:text-4xl">
                Free and premium reading, attached to your account
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ds-muted)]">
                Browse published PDF resources. Free items remain accessible to
                signed-in users; premium items are unlocked only after verified
                payment and then appear in your personal digital library.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={PUBLIC_ROUTES.digitalLibrary}
                  className={`${buttonVariants({
                    size: 'lg',
                  })} min-h-12 rounded-xl`}
                >
                  Explore digital library
                </Link>
                <Link
                  to="/digital-library"
                  className={`${buttonVariants({
                    variant: 'outline',
                    size: 'lg',
                  })} min-h-12 rounded-xl`}
                >
                  My purchases
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {LIBRARY_SECURITY.map(({ title, text, icon: Icon }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] text-[var(--ds-gold)]">
                    <Icon size={15} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--ds-text)]">
                      {title}
                    </p>
                    <p className="mt-1 text-[9px] leading-5 text-[var(--ds-muted)]">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
        <div className="rounded-[22px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-6 py-10 text-center sm:px-10">
          <Sparkles size={22} className="mx-auto text-[var(--ds-gold)]" />
          <h2 className="mx-auto mt-4 max-w-2xl text-2xl sm:text-3xl">
            Begin with one mantra and one intentional session
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--ds-muted)]">
            Your existing V1 practice experience stays intact. Version 2 adds
            the public site, digital library and secure premium access around it.
          </p>
          <div className="mt-6 flex justify-center">
            <PublicCTA />
          </div>
        </div>
      </section>
    </div>
  );
}
