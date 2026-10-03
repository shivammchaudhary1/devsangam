import { apiRequest } from '@/services/api/client';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, Outlet } from 'react-router';

export function AdminShell() {
  const authorization = useQuery({
    queryKey: ['admin', 'session'],
    queryFn: () => apiRequest('/admin/session'),
    retry: false,
    staleTime: 0,
  });
  if (authorization.isPending)
    return (
      <p role="status" className="p-8">
        Checking administrator access…
      </p>
    );
  if (authorization.isError)
    return (
      <main className="p-8">
        <h1 className="text-2xl">Administrator access unavailable</h1>
        <p className="mt-4">
          Your active account must be authorized by the server.
        </p>
        <Link className="mt-5 inline-block underline" to="/">
          Return to app
        </Link>
      </main>
    );
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border p-5">
        <Link to="/" className="ds-gold-text font-display text-xl">
          DevSangam
        </Link>
        <span className="ml-4">Administration</span>
      </header>
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <nav
          aria-label="Admin navigation"
          className="mb-8 flex flex-wrap gap-2"
        >
          {[
            'analytics',
            'content',
            'products',
            'orders',
            'users',
            'contact',
            'entitlements',
            'audit',
          ].map((tab) => (
            <NavLink
              key={tab}
              to={`/admin/${tab}`}
              className={({ isActive }) =>
                `rounded-lg border border-border px-4 py-3 capitalize ${isActive ? 'bg-accent' : ''}`
              }
            >
              {tab}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
