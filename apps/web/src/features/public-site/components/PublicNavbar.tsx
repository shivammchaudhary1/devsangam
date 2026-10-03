import { PUBLIC_NAVIGATION } from '../constants/public-routes';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import logoSymbol from '@/assets/Images/common/logoSymbol.webp';
import { buttonVariants } from '@/components/ui/button-variants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/features/theme/hooks/useTheme';
import { Menu, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

export function PublicNavbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const { preference, setThemePreference } = useTheme();
  const location = useLocation();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const open = openAt === location.key;

  return (
    <header className="border-b border-border bg-[var(--ds-sidebar)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="DevSangam home"
        >
          <img
            src={logoSymbol}
            alt=""
            width={44}
            height={44}
            className="size-11 shrink-0"
          />
          <span className="ds-gold-text font-display text-xl font-semibold">
            DevSangam
          </span>
        </Link>
        <button
          ref={menuRef}
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="public-navigation"
          onClick={() => setOpenAt(open ? null : location.key)}
          className="flex size-11 items-center justify-center rounded-lg border border-border xl:hidden"
        >
          {open ? (
            <X aria-hidden="true" size={22} />
          ) : (
            <Menu aria-hidden="true" size={22} />
          )}
        </button>
        <div
          id="public-navigation"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && open) {
              setOpenAt(null);
              menuRef.current?.focus();
            }
          }}
          className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-4 xl:flex xl:w-auto xl:flex-row xl:items-center`}
        >
          <nav
            aria-label="Public navigation"
            className="flex flex-col gap-1 xl:flex-row"
          >
            {PUBLIC_NAVIGATION.map(({ label, path }) =>
              path.includes('#') ? (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpenAt(null)}
                  className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  {label}
                </Link>
              ) : (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  onClick={() => setOpenAt(null)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-3 text-sm ${isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`
                  }
                >
                  {label}
                </NavLink>
              )
            )}
          </nav>
          <div className="flex min-h-11 flex-wrap items-center gap-3 xl:w-[310px] xl:shrink-0">
            <div className="flex min-h-11 w-[180px] items-center gap-2">
              {isLoading ? (
                <span className="text-sm text-muted-foreground" role="status">
                  Checking session…
                </span>
              ) : isAuthenticated ? (
                <Link to="/" className={`${buttonVariants()} min-h-11`}>
                  Open App
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to={APP_ROUTES.auth.login}
                    className={`${buttonVariants({ variant: 'outline' })} min-h-11`}
                  >
                    Login
                  </Link>
                  <Link
                    to={APP_ROUTES.auth.register}
                    className={`${buttonVariants()} min-h-11`}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
            <div className="flex min-h-11 w-[118px] items-center">
              {!isAuthenticated && !isLoading && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Theme
                  <select
                    aria-label="Theme"
                    value={preference}
                    onChange={(event) =>
                      setThemePreference(
                        event.target.value as 'dark' | 'light' | 'system'
                      )
                    }
                    className="min-h-10 rounded-lg border border-border bg-background px-2 text-foreground"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </label>
              )}
              {isAuthenticated && (
                <Link
                  to={APP_ROUTES.settings}
                  className="py-3 text-sm text-muted-foreground"
                >
                  Appearance settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
