'use client';

import { PublicCTA } from '../components/PublicCTA';
import { PublicPageShell } from '../components/PublicPageShell';

export function AboutPage() {
  return (
    <PublicPageShell
      title="About DevSangam"
      intro="A focused companion for mantra Sadhana, built around the practice you choose."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <section className="ds-panel p-7">
          <h2 className="text-xl">Devotion, at your pace</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            DevSangam aims to make daily practice easier to begin and continue
            without a noisy feed or competitive leaderboard. It supports
            personal reflection and consistency while respecting the meaning you
            bring to your devotional practice.
          </p>
        </section>
        <section className="ds-panel p-7">
          <h2 className="text-xl">Useful, thoughtful tools</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            Explore mantras and their meanings, save favorites, set a chanting
            target and practice with a digital Japamala. Your dashboard, history
            and insights help you revisit your journey. Profile and Settings let
            you choose your preferences.
          </p>
        </section>
        <section className="ds-panel p-7">
          <h2 className="text-xl">Continuity and care</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            Local browser storage supports continuing prepared practice sessions
            offline and syncing later. Account sessions protect your personal
            app experience. You can choose whether to enable device
            notifications and daily reminders.
          </p>
        </section>
        <section className="ds-panel p-7">
          <h2 className="text-xl">Growing with purpose</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            Our digital devotional library brings together published free and
            premium reading resources. When purchases are enabled, verified access
            stays with your account. Our focus remains a calm, respectful experience
            for existing and new practitioners.
          </p>
        </section>
      </div>
      <div className="mt-9">
        <PublicCTA />
      </div>
    </PublicPageShell>
  );
}
