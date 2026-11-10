'use client';

import { PublicCTA } from '../components/PublicCTA';
import { PublicPageShell } from '../components/PublicPageShell';

const STEPS = [
  [
    'Create an account or sign in',
    'Use your email and password to enter your personal practice space. Existing users can keep using their current account.',
  ],
  [
    'Choose a mantra',
    'Browse the mantra library, read the Sanskrit, transliteration and meaning, and save favorites.',
  ],
  [
    'Set your target',
    'Choose your chanting target in practice setup, or use your saved default. Start the session while connected.',
  ],
  [
    'Use your digital Japamala',
    'Count chants at your own pace. Pause and resume when needed, then complete or abandon the session.',
  ],
  [
    'Continue when offline',
    'A prepared session can continue using local browser storage. Keep this browser’s practice data so it can sync later. Mantras you have not loaded may need a connection.',
  ],
  [
    'Reconnect and synchronize',
    'When the connection returns, pending local practice updates sync with the server. Server-completed or abandoned sessions remain authoritative.',
  ],
  [
    'Reflect on your journey',
    'Visit your dashboard and insights to review history, activity and streaks. Choose appearance, sound, haptics and optional reminders in Settings.',
  ],
];

export function HowItWorksPage() {
  return (
    <PublicPageShell
      title="How It Works"
      intro="Begin with a mantra and a target. Let your practice find its rhythm."
    >
      <ol className="grid gap-5 md:grid-cols-2">
        {STEPS.map(([title, text], index) => (
          <li key={title} className="ds-panel p-6">
            <p className="mb-3 text-sm font-semibold text-[var(--ds-gold)]">
              Step {index + 1}
            </p>
            <h2 className="text-lg">{title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
      <section className="mt-10 rounded-xl border border-border p-7">
        <h2 className="text-xl">Explore digital resources</h2>
        <p className="mt-3 leading-8 text-muted-foreground">
          Browse published free and premium resources in the digital library.
          When checkout is available, a verified payment unlocks the item in
          your account. PDF downloads require a connection.
        </p>
      </section>
      <div className="mt-9">
        <PublicCTA />
      </div>
    </PublicPageShell>
  );
}
