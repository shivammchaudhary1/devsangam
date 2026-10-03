import { PUBLIC_NAVIGATION } from '../constants/public-routes';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import logoSymbol from '@/assets/Images/common/logoSymbol.webp';
import { buttonVariants } from '@/components/ui/button-variants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/features/theme/hooks/useTheme';
import { Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {PUBLIC_NAVIGATION.map(({ label, path }) =>
        path.includes('#') ? (
          <Link
            key={path}
            to={path}
            onClick={onNavigate}
            className="rounded-lg px-3 py-2.5 text-[11px] font-medium text-[var(--ds-muted)] transition hover:bg-[var(--ds-white-03)] hover:text-[var(--ds-text)]"
          >
            {label}
          </Link>
        ) : (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'rounded-lg px-3 py-2.5 text-[11px] font-medium transition',
                isActive
                  ? 'bg-[var(--ds-amber-08)] text-[var(--ds-soft-gold)]'
                  : 'text-[var(--ds-muted)] hover:bg-[var(--ds-white-03)] hover:text-[var(--ds-text)]',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        )
      )}
    </>
  );
}

export function PublicNavbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const { preference, setThemePreference } = useTheme();
  const location = useLocation();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === location.key;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)]/92 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="DevSangam home">
          <img src={logoSymbol} alt="" width={44} height={44} className="size-11 shrink-0 object-contain" />
          <div className="min-w-0">
            <span className="ds-gold-text block truncate font-display text-[18px] font-semibold sm:text-xl">DevSangam</span>
            <span className="mt-0.5 hidden text-[7px] uppercase tracking-[0.16em] text-[var(--ds-gold)] sm:block">Chant. Connect. Transform.</span>
          </div>
        </Link>

        <nav aria-label="Public navigation" className="hidden items-center gap-0.5 lg:flex">
          <NavigationLinks />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!isLoading ? (
            <label className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] px-3 text-[9px] text-[var(--ds-muted)]">
              Theme
              <select
                aria-label="Theme"
                value={preference}
                onChange={(event) =>
                  setThemePreference(event.target.value as 'dark' | 'light' | 'system')
                }
                className="bg-transparent text-[10px] font-semibold text-[var(--ds-text)] outline-none"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </label>
          ) : null}

          {isLoading ? (
            <span className="px-3 text-[10px] text-[var(--ds-muted)]">Checking session…</span>
          ) : isAuthenticated ? (
            <Link to="/" className={`${buttonVariants()} min-h-10 rounded-xl px-4 text-[11px]`}>
              Open App
            </Link>
          ) : (
            <>
              <Link to={APP_ROUTES.auth.login} className={`${buttonVariants({ variant: 'outline' })} min-h-10 rounded-xl px-4 text-[11px]`}>
                Login
              </Link>
              <Link to={APP_ROUTES.auth.register} className={`${buttonVariants()} min-h-10 rounded-xl px-4 text-[11px]`}>
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="public-mobile-navigation"
          onClick={() => setOpenAt(open ? null : location.key)}
          className="flex size-10 items-center justify-center rounded-xl border border-[var(--ds-border-soft)] text-[var(--ds-text)] lg:hidden"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open ? (
        <div id="public-mobile-navigation" className="border-t border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)] px-4 py-4 lg:hidden">
          <nav aria-label="Mobile public navigation" className="mx-auto flex max-w-7xl flex-col gap-1">
            <NavigationLinks onNavigate={() => setOpenAt(null)} />
          </nav>
          <div className="mx-auto mt-4 grid max-w-7xl gap-3 border-t border-[var(--ds-border-soft)] pt-4 sm:grid-cols-[1fr_auto]">
            <label className="flex min-h-11 items-center justify-between rounded-xl border border-[var(--ds-border-soft)] px-3 text-[10px] text-[var(--ds-muted)]">
              Appearance
              <select
                aria-label="Theme"
                value={preference}
                onChange={(event) =>
                  setThemePreference(event.target.value as 'dark' | 'light' | 'system')
                }
                className="bg-transparent text-[11px] font-semibold text-[var(--ds-text)] outline-none"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </label>
            {!isLoading ? (
              isAuthenticated ? (
                <Link to="/" className={`${buttonVariants()} min-h-11 rounded-xl`}>
                  <Sparkles size={14} />
                  Open App
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to={APP_ROUTES.auth.login} className={`${buttonVariants({ variant: 'outline' })} min-h-11 rounded-xl`}>
                    Login
                  </Link>
                  <Link to={APP_ROUTES.auth.register} className={`${buttonVariants()} min-h-11 rounded-xl`}>
                    Get Started
                  </Link>
                </div>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
