'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link, useLocation, useNavigate } from '@/lib/navigation';
import { ChevronDown, House, LayoutDashboard, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useState } from 'react';

const menuItemClass =
  'flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[12px] ' +
  'text-[var(--ds-text)] outline-none transition-colors ' +
  'focus:bg-[var(--ds-amber-10)] focus:text-[var(--ds-soft-gold)] ' +
  'data-[highlighted]:bg-[var(--ds-amber-10)] data-[highlighted]:text-[var(--ds-soft-gold)]';

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words.slice(0, 2).map((word) => word[0]) : [words[0]?.[0] ?? '?'])
    .join('')
    .toLocaleUpperCase();
}

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user?.name?.trim() || user?.email || 'My account';
  const initials = initialsFor(user?.name || user?.email || '?');
  const isAdmin = user?.role === 'admin';
  const inAdminWorkspace = pathname === '/admin' || pathname.startsWith('/admin/');
  // Admins can switch between workspaces; landing offers both destinations.
  const showUserDashboard = isAdmin ? (inAdminWorkspace || pathname === '/') : pathname !== '/dashboard';

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } catch {
      // AuthProvider clears local authentication even if remote sign-out fails.
    } finally {
      navigate('/auth/login', { replace: true });
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] text-[var(--ds-gold)] shadow-[var(--ds-shadow-card)] transition hover:bg-[var(--ds-amber-10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-amber)]"
        >
          <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-[var(--ds-amber-10)] font-semibold text-[11px]">
            {initials}
            {user?.avatar ? (
              <img
                key={user.avatar}
                src={user.avatar}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full object-cover"
                onError={(event) => { event.currentTarget.hidden = true; }}
              />
            ) : null}
          </span>
          <ChevronDown size={10} aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[var(--ds-sidebar)]" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[90] w-60 rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-sidebar)] p-2 text-[var(--ds-text)] shadow-2xl outline-none"
        >
          <div className="border-b border-[var(--ds-border-soft)] px-3 pb-3 pt-2">
            <p className="truncate font-semibold text-[13px]">{displayName}</p>
            <p className="mt-1 truncate text-[11px] text-[var(--ds-muted)]">{user?.email}</p>
          </div>

          <div className="py-1">
            <DropdownMenu.Item asChild>
              <Link to="/" className={menuItemClass}>
                <House size={16} aria-hidden="true" />
                Home
              </Link>
            </DropdownMenu.Item>
            {showUserDashboard && (
              <DropdownMenu.Item asChild>
                <Link to="/dashboard" className={menuItemClass}>
                  <LayoutDashboard size={16} aria-hidden="true" />
                  User Dashboard
                </Link>
              </DropdownMenu.Item>
            )}
            {isAdmin && !inAdminWorkspace && (
              <DropdownMenu.Item asChild>
                <Link to="/admin" className={menuItemClass}>
                  <ShieldCheck size={16} aria-hidden="true" />
                  Admin Dashboard
                </Link>
              </DropdownMenu.Item>
            )}
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-[var(--ds-border-soft)]" />
          <DropdownMenu.Item
            disabled={signingOut}
            onSelect={() => { void handleSignOut(); }}
            className={menuItemClass + ' text-red-400 data-[disabled]:cursor-wait data-[disabled]:opacity-60'}
          >
            {signingOut ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
