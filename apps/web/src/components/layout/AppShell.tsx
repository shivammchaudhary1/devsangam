import { Bell, Flame, Settings } from 'lucide-react';

import { NavLink, Outlet } from 'react-router';

import { LogoutButton } from '@/features/auth/components/LogoutButton';

import { APP_NAVIGATION } from './constants/navigation.constants';
import { LAYOUT_ASSETS } from './constants/layout-assets';

export function AppShell() {
  return (
    <div className="min-h-dvh bg-[#07111f] text-white">
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-[300px] shrink-0 overflow-hidden border-r border-amber-400/15 bg-[#070c13] md:flex md:flex-col">
          <img
            src={LAYOUT_ASSETS.sidebarBackground}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[#060b12]/48"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#07111f]/55"
          />

          <div className="relative z-10 flex h-full min-h-0 flex-col">
            <div className="px-5 pb-7 pt-6">
              <div className="flex items-center gap-3.5">
                <img
                  src={LAYOUT_ASSETS.logoSymbol}
                  alt="DevSangam"
                  width={62}
                  height={62}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-[62px] w-[62px] shrink-0 rounded-full object-contain"
                />

                <div className="min-w-0">
                  <h1 className="font-serif text-[24px] font-medium tracking-wide text-[#e6c875]">
                    DevSangam
                  </h1>

                  <p className="mt-1 whitespace-nowrap text-[10px] tracking-wide text-amber-400/85">
                    Chant. Connect. Transform.
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2 px-3">
              {APP_NAVIGATION.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    [
                      'flex h-[50px] items-center gap-3 rounded-xl border px-4',
                      'text-[14px] font-medium backdrop-blur-sm',
                      'transition-all duration-200',

                      isActive
                        ? [
                            'border-amber-400/35',
                            'bg-amber-400/[0.10]',
                            'text-white',
                            'shadow-[0_0_22px_rgba(245,158,11,0.06)]',
                          ].join(' ')
                        : [
                            'border-transparent',
                            'text-slate-300',
                            'hover:border-white/[0.07]',
                            'hover:bg-white/[0.045]',
                            'hover:text-white',
                          ].join(' '),
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        className={
                          isActive ? 'text-amber-400' : 'text-slate-400'
                        }
                      />

                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}

              <button
                type="button"
                className="flex h-[50px] w-full items-center gap-3 rounded-xl border border-transparent px-4 text-[14px] font-medium text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.07] hover:bg-white/[0.045] hover:text-white"
              >
                <Settings
                  size={19}
                  strokeWidth={1.8}
                  className="text-slate-400"
                />

                <span>Settings</span>
              </button>
            </nav>

            <div className="mt-auto px-4 pb-4">
              <div className="mb-3 rounded-2xl border border-amber-400/35 bg-[#080e16]/82 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-amber-200">
                    Daily reminder
                  </p>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/[0.10]">
                    <Bell
                      size={14}
                      strokeWidth={1.8}
                      className="text-amber-300"
                    />
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                  Discipline today,
                  <br />
                  peace forever.
                </p>
              </div>

              <div className="mb-3 flex h-12 items-center justify-between rounded-xl border border-white/[0.10] bg-[#080e16]/82 px-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Flame
                    size={17}
                    strokeWidth={1.8}
                    className="text-orange-400"
                  />

                  <span className="text-xs text-slate-400">Current streak</span>
                </div>

                <span className="text-xs font-medium text-slate-200">
                  0 days
                </span>
              </div>

              <div className="border-t border-white/[0.10] pt-2">
                <LogoutButton />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[#07111f] pb-20 md:pb-0">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-[#0a1019]/95 px-2 py-2 backdrop-blur-xl md:hidden">
          {APP_NAVIGATION.map(({ mobileLabel, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                [
                  'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2',
                  'transition-all duration-200',

                  isActive
                    ? 'bg-amber-400/[0.08] text-amber-300'
                    : 'text-slate-400',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    className={isActive ? 'text-amber-300' : ''}
                  />

                  <span className="text-[10px]">{mobileLabel}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
