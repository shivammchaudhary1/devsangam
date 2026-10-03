import { PUBLIC_ROUTES } from '../constants/public-routes';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import logoSymbol from '@/assets/Images/common/logoSymbol.webp';
import { BookOpen, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.8fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logoSymbol} alt="" aria-hidden="true" className="size-11 object-contain" />
              <div>
                <p className="ds-gold-text font-display text-xl">DevSangam</p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-[var(--ds-gold)]">Chant. Connect. Transform.</p>
              </div>
            </Link>
            <p className="mt-5 text-[11px] leading-6 text-[var(--ds-muted)]">
              A calm digital companion for mantra practice, personal history,
              insights and carefully published devotional resources.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ds-border-soft)] px-3 py-1.5 text-[9px] text-[var(--ds-muted)]">
                <ShieldCheck size={12} /> Account-based access
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ds-border-soft)] px-3 py-1.5 text-[9px] text-[var(--ds-muted)]">
                <Sparkles size={12} /> PWA experience
              </span>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gold)]">Explore</p>
            <div className="space-y-3 text-[11px] text-[var(--ds-muted)]">
              <Link className="block hover:text-[var(--ds-text)]" to={PUBLIC_ROUTES.about}>About</Link>
              <Link className="block hover:text-[var(--ds-text)]" to={PUBLIC_ROUTES.howItWorks}>How It Works</Link>
              <Link className="block hover:text-[var(--ds-text)]" to={PUBLIC_ROUTES.digitalLibrary}>Digital Library</Link>
              <Link className="block hover:text-[var(--ds-text)]" to={PUBLIC_ROUTES.contact}>Contact</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gold)]">Account</p>
            <div className="space-y-3 text-[11px] text-[var(--ds-muted)]">
              <Link className="block hover:text-[var(--ds-text)]" to={APP_ROUTES.auth.login}>Login</Link>
              <Link className="block hover:text-[var(--ds-text)]" to={APP_ROUTES.auth.register}>Create account</Link>
              <Link className="block hover:text-[var(--ds-text)]" to="/digital-library">My purchases</Link>
              <Link className="block hover:text-[var(--ds-text)]" to="/">Open DevSangam</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gold)]">Legal & support</p>
            <div className="space-y-3 text-[11px] text-[var(--ds-muted)]">
              <Link className="block hover:text-[var(--ds-text)]" to={PUBLIC_ROUTES.privacy}>Privacy Policy</Link>
              <Link className="block hover:text-[var(--ds-text)]" to={PUBLIC_ROUTES.terms}>Terms &amp; Conditions</Link>
              <a className="flex items-center gap-2 hover:text-[var(--ds-text)]" href="mailto:contact@devsangam.me">
                <Mail size={12} /> contact@devsangam.me
              </a>
              <span className="flex items-center gap-2"><BookOpen size={12} /> Digital resources</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--ds-border-soft)] pt-5 text-[9px] leading-5 text-[var(--ds-muted-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DevSangam. All rights reserved.</p>
          <p>Paid access is attached to your DevSangam account after verified payment.</p>
        </div>
      </div>
    </footer>
  );
}
