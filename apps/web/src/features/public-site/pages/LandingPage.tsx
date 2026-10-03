import { DevotionalPlaceholder } from '../components/DevotionalPlaceholder';
import { PublicCTA } from '../components/PublicCTA';
import { PublicPageShell } from '../components/PublicPageShell';
import { PUBLIC_ROUTES } from '../constants/public-routes';
import { buttonVariants } from '@/components/ui/button-variants';
import {
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  CircleDot,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router';

const FEATURES = [
  {
    title: 'Digital Japamala',
    text: 'Choose a target and count at your own pace. Pause, resume and complete your practice.',
    icon: CircleDot,
  },
  {
    title: 'A mantra companion',
    text: 'Explore Sanskrit, transliterations and meanings, and keep your favorite mantras close.',
    icon: BookOpen,
  },
  {
    title: 'Your practice journey',
    text: 'Review history, chanting activity and streaks through your personal dashboard and insights.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Continue offline',
    text: 'Continue a prepared session with local browser storage, then sync when connectivity returns. Install as a PWA on supported devices.',
    icon: WifiOff,
  },
  {
    title: 'Gentle reminders',
    text: 'Choose daily reminders in Settings and enable device notifications where your browser supports them.',
    icon: Bell,
  },
];

export function LandingPage() {
  return (
    <PublicPageShell
      title="Make space for daily Sadhana"
      intro="DevSangam brings a mantra library, digital Japamala and your practice journey together in one calm devotional companion."
    >
      <section
        aria-label="Begin with DevSangam"
        className="mb-16 grid items-center gap-10 md:grid-cols-2"
      >
        <div>
          <p className="max-w-lg text-base leading-8 text-muted-foreground">
            A few intentional moments. A mantra that speaks to you. A simple way
            to return to your practice, wherever the day takes you.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PublicCTA />
            <Link
              to={PUBLIC_ROUTES.howItWorks}
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
            >
              See how it works
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Your existing mantra practice continues as before.
          </p>
        </div>
        <DevotionalPlaceholder />
      </section>
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="mb-7 text-2xl sm:text-3xl">
          A simple rhythm for your practice
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, text, icon: Icon }) => (
            <article key={title} className="ds-panel p-6">
              <Icon
                aria-hidden="true"
                className="mb-5 text-[var(--ds-gold)]"
                size={26}
              />
              <h3 className="text-lg">{title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        id="digital-library"
        aria-labelledby="digital-library-heading"
        className="ds-panel mt-16 scroll-mt-8 p-7 sm:p-10"
      >
        <p className="mb-3 text-sm font-semibold text-[var(--ds-gold)]">
          Digital resources
        </p>
        <h2 id="digital-library-heading" className="text-2xl sm:text-3xl">
          A growing digital devotional library
        </h2>
        <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
          Explore free and premium devotional reading resources as they are
          published. Sign in to keep purchased resources in your digital
          library. Your mantra practice remains available in the app.
        </p>
        <div className="mt-6">
          <Link
            to={PUBLIC_ROUTES.digitalLibrary}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Explore digital library
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
