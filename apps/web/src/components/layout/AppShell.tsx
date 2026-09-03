import { LAYOUT_ASSETS } from './constants/layout-assets';
import { APP_NAVIGATION } from './constants/navigation.constants';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInsightsOverview } from '@/features/insights/hooks/useInsightsOverview';
import { PracticeSyncManager } from '@/features/practice/components/PracticeSyncManager';
import { Bell, Flame, Settings, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

export function AppShell() {
  return (
    <div
      className={
        'min-h-dvh bg-[var(--ds-obsidian)] ' + 'text-[var(--ds-cream)]'
      }
    >
      <PracticeSyncManager />

      <div className="flex min-h-dvh">
        <DesktopSidebar />

        <div className={'flex min-w-0 flex-1 flex-col'}>
          <MobileHeader />

          <main
            className={
              'min-w-0 flex-1 bg-[var(--ds-obsidian)] ' + 'pb-[88px] md:pb-0'
            }
          >
            <Outlet />
          </main>
        </div>

        <MobileBottomNavigation />
      </div>
    </div>
  );
}

function DesktopSidebar() {
  return (
    <aside
      className={
        'sticky top-0 hidden h-dvh w-[268px] shrink-0 ' +
        'overflow-hidden border-r border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-sidebar)] md:flex md:flex-col'
      }
    >
      <img
        src={LAYOUT_ASSETS.sidebarBackground}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className={
          'pointer-events-none absolute inset-0 h-full w-full ' +
          'object-cover object-left opacity-10 dark:opacity-75'
        }
      />

      <div
        aria-hidden="true"
        className={
          'pointer-events-none absolute inset-0 hidden ' +
          'bg-[var(--ds-sidebar)] opacity-75 dark:block'
        }
      />

      <div className={'relative z-10 flex h-full min-h-0 flex-col'}>
        <SidebarBrand />

        <SidebarNavigation />

        <SidebarFooter />
      </div>
    </aside>
  );
}

function SidebarBrand() {
  return (
    <div className="px-5 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <img
          src={LAYOUT_ASSETS.logoSymbol}
          alt="DevSangam"
          width={54}
          height={54}
          className={'h-[54px] w-[54px] rounded-full object-contain'}
        />

        <div>
          <h1 className={'ds-gold-text font-serif text-[21px] font-medium'}>
            DevSangam
          </h1>

          <p
            className={
              'mt-1 text-[8px] tracking-[0.08em] ' + 'text-[var(--ds-gold)]'
            }
          >
            Chant. Connect. Transform.
          </p>
        </div>
      </div>

      <div className="ds-gold-line mt-5 opacity-55" />
    </div>
  );
}

function SidebarNavigation() {
  return (
    <nav className="space-y-1.5 px-3">
      {APP_NAVIGATION.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) => getDesktopNavClass(isActive)}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={17}
                strokeWidth={1.65}
                className={
                  isActive
                    ? 'text-[var(--ds-amber-bright)]'
                    : 'text-[var(--ds-muted)]'
                }
              />

              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <NavLink
        to={APP_ROUTES.settings}
        className={({ isActive }) => getDesktopNavClass(isActive)}
      >
        {({ isActive }) => (
          <>
            <Settings
              size={17}
              strokeWidth={1.65}
              className={
                isActive
                  ? 'text-[var(--ds-amber-bright)]'
                  : 'text-[var(--ds-muted)]'
              }
            />

            <span>Settings</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}

function SidebarFooter() {
  const { user } = useAuth();

  const timezone =
    user?.preferences.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data, isLoading, isError } = useInsightsOverview({
    range: '7d',
    timezone,
  });

  const streakLabel =
    isLoading || isError ? '—' : `${data?.summary.currentStreakDays ?? 0} days`;

  return (
    <div className="mt-auto px-4 pb-4">
      <div
        className={
          'mb-3 flex h-11 items-center justify-between ' +
          'rounded-[9px] border border-[var(--ds-border-soft)] ' +
          'bg-[var(--ds-elevated)] px-3 backdrop-blur-md'
        }
      >
        <div className="flex items-center gap-2">
          <Flame
            size={15}
            strokeWidth={1.7}
            className="text-[var(--ds-amber)]"
          />

          <span className={'text-[9px] text-[var(--ds-muted)]'}>
            Current streak
          </span>
        </div>

        <span className={'text-[9px] font-semibold text-[var(--ds-text)]'}>
          {streakLabel}
        </span>
      </div>

      <div className={'border-t border-[var(--ds-border-soft)] pt-2'}>
        <LogoutButton />
      </div>
    </div>
  );
}

function MobileHeader() {
  return (
    <header
      className={
        'sticky top-0 z-40 flex h-[66px] items-center ' +
        'justify-between border-b border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-sidebar)] px-4 backdrop-blur-xl md:hidden'
      }
    >
      <div className={'flex min-w-0 items-center gap-2.5'}>
        <img
          src={LAYOUT_ASSETS.logoSymbol}
          alt=""
          aria-hidden="true"
          width={37}
          height={37}
          className="size-[37px] object-contain"
        />

        <div className="min-w-0">
          <p
            className={
              'ds-gold-text truncate font-serif ' + 'text-[15px] font-medium'
            }
          >
            DevSangam
          </p>

          <p
            className={
              'mt-0.5 truncate text-[7px] tracking-[0.08em] ' +
              'text-[var(--ds-gold)]'
            }
          >
            Chant. Connect. Transform.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={
            'hidden items-center gap-1.5 rounded-full border ' +
            'border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] ' +
            'px-2.5 py-1.5 min-[380px]:flex'
          }
        >
          <Sparkles size={10} className="text-[var(--ds-amber)]" />

          <span className={'text-[8px] text-[var(--ds-bronze)]'}>
            Sacred Practice
          </span>
        </div>

        <div
          className={
            'flex size-8 items-center justify-center ' +
            'rounded-full border border-[var(--ds-border-soft)] ' +
            'bg-[var(--ds-white-03)]'
          }
        >
          <Bell size={14} className="text-[var(--ds-muted)]" />
        </div>
      </div>
    </header>
  );
}

function MobileBottomNavigation() {
  return (
    <nav
      className={
        'fixed inset-x-0 bottom-0 z-50 border-t ' +
        'border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)] ' +
        'px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 ' +
        'backdrop-blur-2xl md:hidden'
      }
    >
      <div className={'mx-auto grid max-w-[520px] grid-cols-5'}>
        {APP_NAVIGATION.map(({ mobileLabel, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              [
                'group relative flex min-w-0 flex-col',
                'items-center justify-center gap-1.5',
                'rounded-xl py-2 transition',
                isActive
                  ? 'text-[var(--ds-soft-gold)]'
                  : 'text-[var(--ds-muted)]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <div
                    className={
                      'absolute inset-x-2 inset-y-0 rounded-xl ' +
                      'border border-[var(--ds-border-gold)] ' +
                      'bg-[var(--ds-amber-08)]'
                    }
                  />
                ) : null}

                <Icon
                  size={19}
                  strokeWidth={isActive ? 1.9 : 1.65}
                  className="relative"
                />

                <span className={'relative truncate text-[9px]'}>
                  {mobileLabel}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function getDesktopNavClass(isActive: boolean) {
  return [
    'group relative flex h-[45px] items-center gap-3',
    'overflow-hidden rounded-[9px] border px-3.5',
    'text-[12px] font-medium transition-all duration-200',
    isActive
      ? [
          'border-[var(--ds-border-gold)]',
          'bg-[var(--ds-amber-08)]',
          'text-[var(--ds-soft-gold)]',
          'shadow-[var(--ds-shadow-gold-inset)]',
        ].join(' ')
      : [
          'border-transparent',
          'text-[var(--ds-muted)]',
          'hover:border-[var(--ds-border-soft)]',
          'hover:bg-[var(--ds-white-03)]',
          'hover:text-[var(--ds-text)]',
        ].join(' '),
  ].join(' ');
}
