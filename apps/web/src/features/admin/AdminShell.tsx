'use client';

import logoSymbol from '@/assets/Images/common/logoSymbol.webp';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { Link, NavLink, useLocation } from '@/lib/navigation';
import { apiRequest } from '@/services/api/client';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  BookOpen,
  Boxes,
  Globe2,
  History,
  Menu,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useEffect, useMemo, useState } from 'react';

const ADMIN_NAVIGATION = [
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Growth, practice and revenue',
    icon: BarChart3,
  },
  {
    key: 'location',
    label: 'Graphical Location',
    description: 'Community across timezones',
    icon: Globe2,
  },
  {
    key: 'content',
    label: 'Mantras Management',
    description: 'Artwork, content and practice',
    icon: BookOpen,
  },
  {
    key: 'products',
    label: 'Digital products',
    description: 'PDF library and pricing',
    icon: Boxes,
  },
  { key: 'orders', label: 'Orders', description: 'Razorpay payment lifecycle', icon: ShoppingBag },
  { key: 'users', label: 'Users', description: 'Account overview', icon: Users },
  { key: 'contact', label: 'Contact', description: 'Support messages', icon: MessageSquare },
  {
    key: 'entitlements',
    label: 'Access',
    description: 'Purchased content grants',
    icon: ShieldCheck,
  },
  { key: 'audit', label: 'Audit log', description: 'Sensitive admin activity', icon: History },
] as const;

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin navigation" className="space-y-1.5">
      {ADMIN_NAVIGATION.map(({ key, label, description, icon: Icon }) => (
        <NavLink
          key={key}
          to={`/admin/${key}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'group flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 transition duration-200',
              isActive
                ? 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-10)] text-[var(--ds-soft-gold)] shadow-[var(--ds-shadow-gold-inset)]'
                : 'border-transparent text-[var(--ds-muted)] hover:border-[var(--ds-border-soft)] hover:bg-[var(--ds-white-03)] hover:text-[var(--ds-text)]',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={[
                  'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                  isActive
                    ? 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-10)]'
                    : 'border-[var(--ds-border-soft)] bg-[var(--ds-white-02)]',
                ].join(' ')}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold">{label}</span>
                <span className="mt-0.5 block truncate text-[9px] font-normal text-[var(--ds-muted-soft)]">
                  {description}
                </span>
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function AdminBrand() {
  return (
    <div className="border-b border-[var(--ds-border-soft)] px-5 py-5">
      <Link to="/" className="flex items-center gap-3">
        <img
          src={logoSymbol.src}
          alt=""
          aria-hidden="true"
          className="size-11 rounded-full object-contain"
        />
        <div className="min-w-0">
          <p className="ds-gold-text truncate font-display text-[17px] font-semibold">DevSangam</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-[var(--ds-muted)]">
            Administration
          </p>
        </div>
      </Link>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-[var(--ds-border-soft)] p-4">
      <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] p-3">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--ds-amber)]" />
        <div>
          <p className="text-[11px] font-semibold text-[var(--ds-text)]">Server-authorized admin</p>
          <p className="mt-1 text-[9px] leading-4 text-[var(--ds-muted)]">
            Care for your content and community.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: import('react').ReactNode }) {
  const authorization = useQuery({
    queryKey: ['admin', 'session'],
    queryFn: () => apiRequest('/admin/session'),
    retry: false,
    staleTime: 0,
  });
  const location = useLocation();
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);
  const mobileOpen = mobileOpenAt === location.key;
  useEffect(() => {
    const viewport = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (viewport.matches) setMobileOpenAt(null);
    };
    viewport.addEventListener('change', closeOnDesktop);
    return () => viewport.removeEventListener('change', closeOnDesktop);
  }, []);

  const activeSection = useMemo(() => {
    const key = location.pathname.split('/')[2] || 'analytics';
    return ADMIN_NAVIGATION.find((item) => item.key === key) ?? ADMIN_NAVIGATION[0];
  }, [location.pathname]);

  if (authorization.isPending) {
    return (
      <main className="ds-page flex min-h-dvh items-center justify-center px-5">
        <div className="ds-panel w-full max-w-md p-7 text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)]">
            <ShieldCheck className="text-[var(--ds-amber)]" size={22} />
          </div>
          <p role="status" className="text-sm text-[var(--ds-muted)]">
            Checking administrator access…
          </p>
        </div>
      </main>
    );
  }

  if (authorization.isError) {
    return (
      <main className="ds-page flex min-h-dvh items-center justify-center px-5">
        <section className="ds-panel w-full max-w-xl p-7 sm:p-9">
          <div className="mb-5 flex size-12 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)]">
            <ShieldCheck className="text-[var(--ds-amber)]" size={22} />
          </div>
          <h1 className="text-2xl">Administrator access unavailable</h1>
          <p className="mt-4 max-w-md leading-7 text-[var(--ds-muted)]">
            Your active account must be authorized by the server. Admin access cannot be enabled
            from the browser.
          </p>
          <Link
            className="ds-gold-button mt-7 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm"
            to="/"
          >
            Return to app
          </Link>
        </section>
      </main>
    );
  }

  return (
    <Dialog.Root
      open={mobileOpen}
      onOpenChange={(open) => setMobileOpenAt(open ? location.key : null)}
    >
      <div className="ds-page min-h-dvh bg-[var(--ds-obsidian)] text-[var(--ds-cream)]">
        <div className="flex min-h-dvh">
          <aside className="sticky top-0 hidden h-dvh w-[286px] shrink-0 border-r border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)] lg:flex lg:flex-col">
            <AdminBrand />
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <Navigation />
            </div>
            <SidebarFooter />
          </aside>

          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-40 border-b border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)]/95 backdrop-blur-xl">
              <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                  <Dialog.Trigger asChild>
                    <button
                      type="button"
                      aria-label="Open admin navigation"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border-soft)] lg:hidden"
                    >
                      <Menu size={19} />
                    </button>
                  </Dialog.Trigger>
                  <div className="min-w-0">
                    <p className="truncate text-[9px] uppercase tracking-[0.18em] text-[var(--ds-gold)]">
                      Admin workspace
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-[var(--ds-text)]">
                      {activeSection.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-gold)] sm:inline-flex">
                    Secure console
                  </span>
                  <ProfileMenu />
                </div>
              </div>
            </header>

            <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
              <div className="mx-auto w-full max-w-[1500px]">{children}</div>
            </main>
          </div>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-[71] flex h-dvh w-[min(88vw,310px)] flex-col border-r border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)] shadow-2xl lg:hidden">
            <Dialog.Title className="sr-only">Admin navigation drawer</Dialog.Title>
            <Dialog.Description className="sr-only">
              Choose an admin section or return to the user dashboard.
            </Dialog.Description>
            <div className="flex items-center justify-between border-b border-[var(--ds-border-soft)] pr-4">
              <AdminBrand />
              <button
                type="button"
                aria-label="Close admin navigation"
                onClick={() => setMobileOpenAt(null)}
                className="flex size-10 items-center justify-center rounded-xl border border-[var(--ds-border-soft)]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <Navigation onNavigate={() => setMobileOpenAt(null)} />
            </div>
            <SidebarFooter />
          </Dialog.Content>
        </Dialog.Portal>
      </div>
    </Dialog.Root>
  );
}
