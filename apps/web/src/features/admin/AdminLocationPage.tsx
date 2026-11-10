'use client';

import { adminSecondaryButton } from './admin.styles';
import { apiRequest } from '@/services/api/client';
import type { ApiResult } from '@devsangam/types';
import { useQuery } from '@tanstack/react-query';
import { Globe2, MapPin, RefreshCw, Search, Users } from 'lucide-react';
import { useState } from 'react';

type LocationGroup = {
  timezone: string;
  region: string;
  users: number;
  sessions: number;
  chants: number;
};
const regions = ['Asia', 'Europe', 'America', 'Africa', 'Oceania', 'Unspecified'];
export function AdminLocationPage() {
  const [region, setRegion] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: () => apiRequest<ApiResult<{ groups: LocationGroup[] }>>('/admin/locations'),
    retry: false,
  });
  if (query.isPending)
    return (
      <div role="status" className="ds-panel p-8 text-sm text-[var(--ds-muted)]">
        Loading community locations…
      </div>
    );
  if (query.isError)
    return (
      <div className="ds-panel p-8">
        <h1 className="text-2xl">Graphical Location</h1>
        <p role="alert" className="mt-4 text-sm text-red-400">
          {query.error.message}
        </p>
        <button onClick={() => void query.refetch()} className={`${adminSecondaryButton} mt-5`}>
          Try again
        </button>
      </div>
    );
  const groups = query.data.data.groups;
  const total = groups.reduce((sum, item) => sum + item.users, 0);
  const counts = regions.map((name) => ({
    name,
    count: groups.filter((item) => item.region === name).reduce((sum, item) => sum + item.users, 0),
  }));
  const filtered = groups.filter(
    (item) =>
      (region === 'All' || item.region === region) &&
      item.timezone.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ds-eyebrow">A connected community</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Graphical Location</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ds-muted)]">
            Explore where your community sets its daily rhythm. Regions reflect saved account
            timezones, not verified physical locations.
          </p>
        </div>
        <button
          aria-label="Refresh location data"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className={adminSecondaryButton}
        >
          <RefreshCw size={14} className={query.isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="ds-panel flex flex-col items-center justify-center p-6 text-center">
          <div className="relative z-10 w-full">
            <div className="relative mx-auto flex size-56 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[radial-gradient(ellipse_at_center,var(--ds-amber-10),transparent_70%)]">
              <Globe2
                strokeWidth={0.65}
                className="absolute inset-3 size-50 text-[var(--ds-gold)] opacity-20"
              />
              <div className="relative rounded-2xl border border-[var(--ds-border-gold)] bg-[var(--ds-sidebar)]/90 px-5 py-4">
                <Users size={21} className="mx-auto mb-3 text-[var(--ds-gold)]" />
                <p className="ds-stat-value text-4xl">{total.toLocaleString()}</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-[var(--ds-muted)]">
                  Community accounts
                </p>
              </div>
            </div>
            <h2 className="mt-6 text-xl">Across timezones</h2>
            <p className="mt-2 text-xs leading-6 text-[var(--ds-muted)]">
              {groups.length} saved timezones ·{' '}
              {counts.filter((item) => item.name !== 'Unspecified' && item.count > 0).length}{' '}
              regional groups
            </p>
            <p className="mt-4 text-[10px] leading-5 text-[var(--ds-muted-soft)]">
              UTC, missing and unrecognized settings appear as unspecified. No GPS or IP location is
              collected.
            </p>
          </div>
        </article>
        <article className="ds-panel p-5 sm:p-6">
          <div className="relative z-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl">Regional distribution</h2>
              <button
                onClick={() => {
                  setRegion('All');
                  setPage(1);
                }}
                className="text-xs text-[var(--ds-gold)]"
                aria-pressed={region === 'All'}
              >
                All regions
              </button>
            </div>
            <div className="space-y-2">
              {counts.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setRegion(item.name);
                    setPage(1);
                  }}
                  aria-pressed={region === item.name}
                  className={`w-full rounded-xl border p-3 text-left transition ${region === item.name ? 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)]' : 'border-transparent hover:bg-[var(--ds-white-03)]'}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <MapPin size={13} className="text-[var(--ds-gold)]" />
                      {item.name}
                    </span>
                    <span className="tabular-nums text-[var(--ds-muted)]">
                      {item.count.toLocaleString()} ·{' '}
                      {total ? Math.round((item.count / total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ds-white-06)]">
                    <div
                      className="h-full rounded-full bg-[var(--ds-gold)]"
                      style={{ width: `${total ? (item.count / total) * 100 : 0}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </article>
      </div>
      <section className="ds-panel mt-5 p-5 sm:p-6">
        <div className="relative z-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl">Timezone breakdown</h2>
            <label className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-3.5 text-[var(--ds-muted)]" />
              <input
                aria-label="Search timezones"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search a timezone…"
                className="min-h-11 w-full rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-night)] pl-9 pr-3 text-xs"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-xs">
              <thead className="border-b border-[var(--ds-border-soft)] text-[10px] uppercase tracking-wide text-[var(--ds-muted)]">
                <tr>
                  {['Timezone', 'Accounts', 'Sessions', 'Chants'].map((label) => (
                    <th key={label} scope="col" className="pb-3 pr-4 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * 15, page * 15).map((item) => (
                  <tr
                    key={item.timezone}
                    className="border-b border-[var(--ds-border-soft)] last:border-0"
                  >
                    <td className="py-4 pr-4">
                      <span className="font-medium">{item.timezone}</span>
                      <span className="mt-1 block text-[10px] text-[var(--ds-muted)]">
                        {item.region}
                      </span>
                    </td>
                    <td className="py-4 pr-4 tabular-nums">{item.users.toLocaleString()}</td>
                    <td className="py-4 pr-4 tabular-nums">{item.sessions.toLocaleString()}</td>
                    <td className="py-4 tabular-nums">{item.chants.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && (
            <p role="status" className="py-10 text-center text-sm text-[var(--ds-muted)]">
              No timezones match this selection.
            </p>
          )}
          {filtered.length > 15 && (
            <div className="mt-5 flex items-center justify-between text-xs">
              <span className="text-[var(--ds-muted)]">
                Page {page} of {Math.ceil(filtered.length / 15)}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                  className={adminSecondaryButton}
                >
                  Previous
                </button>
                <button
                  disabled={page * 15 >= filtered.length}
                  onClick={() => setPage((value) => value + 1)}
                  className={adminSecondaryButton}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
