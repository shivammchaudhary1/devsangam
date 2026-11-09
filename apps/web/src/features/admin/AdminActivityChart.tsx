'use client';

import { TrendingUp } from 'lucide-react';
import { useState } from 'react';

export type ActivityDay = { date: string; sessions: number; registrations: number };
export function AdminActivityChart({ days }: { days: ActivityDay[] }) {
  const [metric, setMetric] = useState<'sessions' | 'registrations'>('sessions');
  const [selected, setSelected] = useState<string | null>(null);
  const max = Math.max(1, ...days.map((day) => day[metric]));
  const selectedDay = days.find((day) => day.date === selected);
  return (
    <section className="ds-panel mt-5 p-5 sm:p-6">
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="ds-eyebrow">Community rhythm</p>
            <h2 className="mt-2 flex items-center gap-2 text-xl">
              <TrendingUp size={19} className="text-[var(--ds-gold)]" />
              Last 30 days
            </h2>
          </div>
          <div
            className="flex rounded-xl border border-[var(--ds-border-soft)] p-1"
            role="group"
            aria-label="Activity chart metric"
          >
            {(['sessions', 'registrations'] as const).map((value) => (
              <button
                key={value}
                aria-pressed={metric === value}
                onClick={() => {
                  setMetric(value);
                  setSelected(null);
                }}
                className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${metric === value ? 'bg-[var(--ds-amber-10)] text-[var(--ds-gold)]' : 'text-[var(--ds-muted)]'}`}
              >
                {value === 'sessions' ? 'Practice sessions' : 'New users'}
              </button>
            ))}
          </div>
        </div>
        <div
          className="mt-6 flex h-36 items-end gap-1 border-b border-[var(--ds-border-soft)] sm:gap-2"
          aria-label="Daily activity"
        >
          {days.map((day) => (
            <button
              key={day.date}
              aria-label={`${day.date}: ${day[metric]} ${metric}`}
              title={`${day.date}: ${day[metric]}`}
              onFocus={() => setSelected(day.date)}
              onMouseEnter={() => setSelected(day.date)}
              onClick={() => setSelected(day.date)}
              className="group flex h-full min-w-0 flex-1 items-end rounded-t outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-gold)]"
            >
              <span
                className={`block w-full rounded-t ${selected === day.date ? 'bg-[var(--ds-gold)]' : 'bg-[var(--ds-amber)]/65 group-hover:bg-[var(--ds-gold)]'}`}
                style={{
                  height: `${Math.max(day[metric] ? 4 : 1, (day[metric] / max) * 100)}%`,
                  opacity: day[metric] ? 1 : 0.2,
                }}
              />
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-[10px] text-[var(--ds-muted)]">
          <span>
            {days[0]?.date} — {days.at(-1)?.date} · UTC
          </span>
          <span role="status">
            {selectedDay
              ? `${selectedDay.date}: ${selectedDay[metric].toLocaleString()} ${metric}`
              : `${days.reduce((sum, day) => sum + day[metric], 0).toLocaleString()} total ${metric}`}
          </span>
        </div>
        {!days.length && (
          <p className="mt-4 text-xs text-[var(--ds-muted)]">
            Activity will appear as your community grows.
          </p>
        )}
      </div>
    </section>
  );
}
