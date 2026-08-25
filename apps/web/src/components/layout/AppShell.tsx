import { LAYOUT_ASSETS } from './constants/layout-assets';
import { APP_NAVIGATION } from './constants/navigation.constants';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { PracticeSyncManager } from '@/features/practice/components/PracticeSyncManager';
import { Bell, Flame, Settings, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

export function AppShell() {
  return (
    <div className="min-h-dvh bg-[var(--ds-obsidian)] text-[var(--ds-cream)]">
      <PracticeSyncManager />

      <div className="flex min-h-dvh">
        <DesktopSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />

          <main className="min-w-0 flex-1 bg-[var(--ds-obsidian)] pb-[88px] md:pb-0">
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
    <aside className="sticky top-0 hidden h-dvh w-[268px] shrink-0 overflow-hidden border-r border-white/[0.07] bg-[#070c12] md:flex md:flex-col">
      <img
        src={LAYOUT_ASSETS.sidebarBackground}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left opacity-75"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#05090f]/70"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,15,0.2),rgba(5,9,15,0.62)_58%,rgba(5,9,15,0.94))]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(216,154,53,0.22)_28%,rgba(216,154,53,0.1)_70%,transparent)]"
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col">
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
        <div className="relative shrink-0">
          <div
            aria-hidden="true"
            className="absolute inset-2 rounded-full bg-amber-400/15 blur-xl"
          />

          <img
            src={LAYOUT_ASSETS.logoSymbol}
            alt="DevSangam"
            width={54}
            height={54}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="relative h-[54px] w-[54px] rounded-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <h1 className="ds-gold-text font-serif text-[21px] font-medium tracking-[0.02em]">
            DevSangam
          </h1>

          <p className="mt-1 text-[8px] font-medium tracking-[0.08em] text-[#b68131]">
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
          className={({ isActive }) =>
            [
              'group relative flex h-[45px] items-center gap-3 overflow-hidden rounded-[9px] border px-3.5',
              'text-[12px] font-medium',
              'transition-all duration-200',
              isActive
                ? [
                    'border-[#d89a35]/35',
                    'bg-[linear-gradient(90deg,rgba(216,154,53,0.15),rgba(216,154,53,0.045)_68%,transparent)]',
                    'text-[#f1dfb7]',
                    'shadow-[inset_2px_0_0_rgba(216,154,53,0.75),0_0_22px_rgba(216,154,53,0.045)]',
                  ].join(' ')
                : [
                    'border-transparent',
                    'text-[#8b929c]',
                    'hover:border-white/[0.06]',
                    'hover:bg-white/[0.025]',
                    'hover:text-[#d8d5d0]',
                  ].join(' '),
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-14 bg-amber-400/[0.035] blur-lg"
                />
              ) : null}

              <Icon
                size={17}
                strokeWidth={1.65}
                className={[
                  'relative shrink-0 transition-colors',
                  isActive
                    ? 'text-[#e5aa48]'
                    : 'text-[#68717d] group-hover:text-[#a7adb5]',
                ].join(' ')}
              />

              <span className="relative truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <button
        type="button"
        className="group flex h-[45px] w-full items-center gap-3 rounded-[9px] border border-transparent px-3.5 text-[12px] font-medium text-[#8b929c] transition-all duration-200 hover:border-white/[0.06] hover:bg-white/[0.025] hover:text-[#d8d5d0]"
      >
        <Settings
          size={17}
          strokeWidth={1.65}
          className="shrink-0 text-[#68717d] transition-colors group-hover:text-[#a7adb5]"
        />

        <span>Settings</span>
      </button>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto px-4 pb-4">
      <div className="mb-3 rounded-[11px] border border-[#d89a35]/18 bg-[#0a1018]/82 p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.2)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#c88b32]">
              Daily reminder
            </p>

            <p className="mt-2 text-[10px] leading-[1.65] text-[#727a85]">
              Discipline today,
              <br />
              peace forever.
            </p>
          </div>

          <div className="flex size-8 items-center justify-center rounded-lg border border-[#d89a35]/15 bg-[#d89a35]/[0.055]">
            <Bell size={14} strokeWidth={1.6} className="text-[#c58a34]" />
          </div>
        </div>
      </div>

      <div className="mb-3 flex h-11 items-center justify-between rounded-[9px] border border-white/[0.065] bg-[#0a1018]/78 px-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Flame size={15} strokeWidth={1.7} className="text-[#d89031]" />

          <span className="text-[9px] text-[#727a85]">Current streak</span>
        </div>

        <span className="text-[9px] font-semibold text-[#c5c0b8]">0 days</span>
      </div>

      <div className="border-t border-white/[0.065] pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-[66px] items-center justify-between border-b border-white/[0.065] bg-[#070c12]/95 px-4 backdrop-blur-xl md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="relative shrink-0">
          <div
            aria-hidden="true"
            className="absolute inset-1 rounded-full bg-amber-400/15 blur-lg"
          />

          <img
            src={LAYOUT_ASSETS.logoSymbol}
            alt=""
            aria-hidden="true"
            width={37}
            height={37}
            className="relative size-[37px] object-contain"
          />
        </div>

        <div className="min-w-0">
          <p className="ds-gold-text truncate font-serif text-[15px] font-medium tracking-wide">
            DevSangam
          </p>

          <p className="mt-0.5 truncate text-[7px] tracking-[0.08em] text-[#9c712f]">
            Chant. Connect. Transform.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-[#d89a35]/15 bg-[#d89a35]/[0.045] px-2.5 py-1.5 min-[380px]:flex">
          <Sparkles size={10} className="text-[#d89a35]" />

          <span className="text-[8px] font-medium text-[#a98755]">
            Sacred Practice
          </span>
        </div>

        <div className="flex size-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025]">
          <Bell size={14} strokeWidth={1.6} className="text-[#9097a2]" />
        </div>
      </div>
    </header>
  );
}

function MobileBottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.075] bg-[#070c12]/96 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-[520px] grid-cols-5">
        {APP_NAVIGATION.map(({ mobileLabel, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              [
                'group relative flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl py-2',
                'transition-all duration-200',
                isActive ? 'text-[#e9b54d]' : 'text-[#737c89]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-2 inset-y-0 rounded-xl border border-[#d89a35]/12 bg-[#d89a35]/[0.07] shadow-[0_0_18px_rgba(216,154,53,0.045)]"
                  />
                ) : null}

                <Icon
                  size={19}
                  strokeWidth={isActive ? 1.9 : 1.65}
                  className={[
                    'relative transition-colors',
                    isActive
                      ? 'text-[#e6ab42]'
                      : 'text-[#748091] group-hover:text-[#a4abb4]',
                  ].join(' ')}
                />

                <span
                  className={[
                    'relative truncate text-[9px]',
                    isActive ? 'font-medium text-[#e4ac45]' : 'text-[#7b8490]',
                  ].join(' ')}
                >
                  {mobileLabel}
                </span>

                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 h-px w-7 bg-[linear-gradient(90deg,transparent,#d89a35,transparent)]"
                  />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
