'use client';

import { PUBLIC_NAVIGATION, PUBLIC_ROUTES } from '../constants/public-routes';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import logoSymbol from '@/assets/Images/common/logoSymbol.webp';
import { Link } from '@/lib/navigation';
import { ArrowUpRight, Heart, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)]">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-8 sm:pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.75fr_0.85fr_1.05fr]">
          <div className="max-w-sm">
            <Link to={PUBLIC_ROUTES.home} className="inline-flex items-center gap-3" aria-label="DevSangam — Home">
              <img src={logoSymbol.src} alt="" aria-hidden="true" width={46} height={46} className="size-12 object-contain" />
              <div>
                <p className="ds-gold-text font-display text-xl">DevSangam</p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-[var(--ds-gold)]">Chant. Connect. Transform.</p>
              </div>
            </Link>
            <p className="mt-5 text-[12px] leading-7 text-[var(--ds-muted)]">
              A gentle digital home for mantra practice, Vedic astrology exploration and devotional resources.
              Make space for the rituals that matter to you.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 py-2 text-[10px] text-[var(--ds-soft-gold)]">
              <Sparkles size={13} aria-hidden="true" /> Made for mindful moments
            </p>
          </div>

          <nav aria-label="Footer explore links">
            <h2 className="mb-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gold)]">Explore</h2>
            <ul className="space-y-3 text-[12px] text-[var(--ds-muted)]">
              {PUBLIC_NAVIGATION.map(({ label, path }) => (
                <li key={path}><Link to={path} className="inline-flex min-h-6 items-center transition hover:text-[var(--ds-soft-gold)]">{label}</Link></li>
              ))}
              <li><Link to={PUBLIC_ROUTES.howItWorks} className="inline-flex min-h-6 items-center transition hover:text-[var(--ds-soft-gold)]">How It Works</Link></li>
            </ul>
          </nav>

          <nav aria-label="Footer account links">
            <h2 className="mb-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gold)]">Your account</h2>
            <ul className="space-y-3 text-[12px] text-[var(--ds-muted)]">
              <li><Link className="transition hover:text-[var(--ds-soft-gold)]" to={APP_ROUTES.auth.login}>Sign In</Link></li>
              <li><Link className="transition hover:text-[var(--ds-soft-gold)]" to={APP_ROUTES.auth.register}>Create account</Link></li>
              <li><Link className="transition hover:text-[var(--ds-soft-gold)]" to="/dashboard">User dashboard</Link></li>
              <li><Link className="transition hover:text-[var(--ds-soft-gold)]" to="/digital-library">My downloads</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="mb-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gold)]">We're here to help</h2>
            <p className="text-[12px] leading-7 text-[var(--ds-muted)]">Questions about products, access or your practice? Reach us through the contact page.</p>
            <Link to={PUBLIC_ROUTES.contact} className="mt-4 inline-flex min-h-10 items-center gap-2 text-[12px] font-semibold text-[var(--ds-soft-gold)]">
              Get in touch <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <a className="mt-3 flex items-center gap-2 break-all text-[11px] text-[var(--ds-muted)] hover:text-[var(--ds-soft-gold)]" href="mailto:contact@devsangam.me">
              <Mail size={14} aria-hidden="true" /> contact@devsangam.me
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[var(--ds-border-soft)] py-6 text-[11px] text-[var(--ds-muted)]">
          <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[var(--ds-gold)]" /> Account-based access</span>
          <span className="inline-flex items-center gap-2"><Heart size={14} className="text-[var(--ds-gold)]" /> Respectful devotional practice</span>
          <span className="inline-flex items-center gap-2"><Sparkles size={14} className="text-[var(--ds-gold)]" /> Digital-first experience</span>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--ds-border-soft)] py-5 text-[11px] text-[var(--ds-muted-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DevSangam. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to={PUBLIC_ROUTES.privacy} className="hover:text-[var(--ds-soft-gold)]">Privacy Policy</Link>
            <Link to={PUBLIC_ROUTES.terms} className="hover:text-[var(--ds-soft-gold)]">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
