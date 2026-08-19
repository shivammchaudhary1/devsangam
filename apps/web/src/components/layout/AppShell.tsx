import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { BarChart3, BookOpen, Home, PlayCircle, User } from 'lucide-react';

import { NavLink, Outlet } from 'react-router';

const navigation = [
  {
    label: 'Home',
    path: '/',
    icon: Home,
  },
  {
    label: 'Start',
    path: '/practice',
    icon: PlayCircle,
  },
  {
    label: 'Insights',
    path: '/insights',
    icon: BarChart3,
  },
  {
    label: 'Library',
    path: '/library',
    icon: BookOpen,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
  },
];

export function AppShell() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex min-h-dvh">
        {/* Desktop Sidebar */}

        <aside
          className="
            hidden
            w-64
            shrink-0
            border-r
            border-sidebar-border
            bg-sidebar
            p-5
            md:flex
            md:flex-col
          "
        >
          {/* <div className="mb-10">
            <div className="font-display text-2xl text-gold-soft">
              DevSangam
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Chant. Connect. Transform.
            </div>
          </div> */}
          <div className="mb-10">
            <div
              className="
      mb-3
      flex
      h-12
      w-12
      items-center
      justify-center
      rounded-full
      border
      border-amber-500/30
      bg-amber-500/10
      text-2xl
      text-amber-400
      shadow-[0_0_25px_rgba(245,158,11,0.15)]
    "
            >
              ॐ
            </div>

            <div
              className="
      font-display
      text-2xl
      text-[#e5c07b]
    "
            >
              DevSangam
            </div>

            <p
              className="
      mt-1
      text-xs
      tracking-wide
      text-[#d4af37]
    "
            >
              Chant. Connect. Transform.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink key={path} to={path} className="ds-sidebar-item">
                <Icon size={18} />

                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto">
            <LogoutButton />
          </div>
        </aside>

        {/* Main Application */}

        <main
          className="
    min-w-0
    flex-1
    bg-background
    pb-20
    md:pb-0
  "
        >
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          className="
            ds-mobile-bottom-nav
            fixed
            inset-x-0
            bottom-0
            z-50
            grid
            grid-cols-5
            md:hidden
          "
        >
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-4 py-3',
                  'text-sm font-medium',
                  'transition-all duration-200',

                  isActive
                    ? [
                        'border',
                        'border-amber-500/40',
                        'bg-amber-500/10',
                        'text-amber-300',
                        'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
                      ].join(' ')
                    : [
                        'text-muted-foreground',
                        'hover:bg-white/5',
                        'hover:text-foreground',
                      ].join(' '),
                ].join(' ')
              }
            >
              <Icon size={18} />

              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
