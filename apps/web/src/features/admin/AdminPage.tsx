import { parseRupees, priceLabel } from '@/features/store/commerce.utils';
import { apiRequest } from '@/services/api/client';
import type { ApiResult, PagedItems } from '@devsangam/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  BookOpen,
  Boxes,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  EyeOff,
  FileText,
  History,
  Lock,
  MessageSquare,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';

type RecordItem = Record<string, unknown> & { _id: string };

type AdminMetrics = {
  users?: number;
  newUsers?: number;
  practice?: {
    sessions?: number;
    completed?: number;
    chants?: number;
    durationSeconds?: number;
  };
  freeMantras?: number;
  paidMantras?: number;
  products?: number;
  publishedProducts?: number;
  orders?: number;
  revenue?: {
    capturedPayments?: number;
    capturedRevenuePaise?: number;
    refundedPaise?: number;
  };
  contacts?: number;
  recentUsers?: RecordItem[];
  recentOrders?: RecordItem[];
  recentContacts?: RecordItem[];
};

const inputClass =
  'mt-2 min-h-11 w-full rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-night)] px-3.5 py-2.5 text-sm text-[var(--ds-text)] outline-none transition placeholder:text-[var(--ds-muted-soft)] focus:border-[var(--ds-border-gold)] focus:ring-2 focus:ring-[var(--ds-amber-08)]';

const secondaryButtonClass =
  'ds-secondary-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-[11px] font-semibold disabled:pointer-events-none disabled:opacity-45';

const primaryButtonClass =
  'ds-gold-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-[11px] font-bold disabled:pointer-events-none disabled:opacity-45';

const SECTION_COPY: Record<
  string,
  { eyebrow: string; description: string; icon: typeof BookOpen }
> = {
  content: {
    eyebrow: 'Sacred content',
    description:
      'Create and manage mantras, publication state, pricing and premium access.',
    icon: BookOpen,
  },
  products: {
    eyebrow: 'Digital commerce',
    description:
      'Create PDF products, upload private files, publish resources and set pricing.',
    icon: Boxes,
  },
  users: {
    eyebrow: 'Accounts',
    description:
      'Review registered accounts and server-authorized account roles.',
    icon: Users,
  },
  orders: {
    eyebrow: 'Payments',
    description:
      'Review Razorpay-backed orders and reconcile incomplete payment states.',
    icon: ShoppingBag,
  },
  contact: {
    eyebrow: 'Support inbox',
    description:
      'Review contact requests submitted through the public DevSangam website.',
    icon: MessageSquare,
  },
  entitlements: {
    eyebrow: 'Content access',
    description:
      'Inspect server-side access grants created after verified successful payments.',
    icon: ShieldCheck,
  },
  audit: {
    eyebrow: 'Security trail',
    description:
      'Review sensitive content and access operations performed by administrators.',
    icon: History,
  },
};

function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The request could not be completed.';
}

function humanize(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
}

function formatNumber(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number)
    ? new Intl.NumberFormat('en-IN').format(number)
    : '0';
}

function formatDate(value: unknown) {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatDuration(seconds: unknown) {
  const total = Math.max(0, Number(seconds ?? 0));
  if (!Number.isFinite(total)) return '0m';
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function statusClass(status: unknown) {
  const value = String(status ?? '').toLowerCase();
  if (
    ['paid', 'active', 'published', 'reviewed', 'admin', 'completed'].includes(
      value
    )
  )
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400';
  if (['failed', 'revoked', 'refunded'].includes(value))
    return 'border-red-500/25 bg-red-500/10 text-red-400';
  if (['payment_pending', 'created', 'new'].includes(value))
    return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
  return 'border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] text-[var(--ds-muted)]';
}

function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusClass(children)}`}
    >
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Users;
}) {
  return (
    <article className="ds-panel min-w-0 p-5">
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-muted)]">
              {label}
            </p>
            <p className="ds-stat-value mt-3 truncate text-2xl sm:text-3xl">
              {value}
            </p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-amber)]">
            <Icon size={18} />
          </span>
        </div>
        <p className="mt-4 text-[10px] leading-5 text-[var(--ds-muted)]">
          {note}
        </p>
      </div>
    </article>
  );
}

function ProgressLine({
  label,
  value,
  max,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  caption: string;
}) {
  const width = max <= 0 ? 0 : Math.min(100, Math.max(4, (value / max) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold text-[var(--ds-text)]">
          {label}
        </span>
        <span className="text-[10px] text-[var(--ds-muted)]">{caption}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--ds-white-06)]">
        <div
          className="h-full rounded-full bg-[var(--ds-gradient-gold)]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function RecentList({
  title,
  icon: Icon,
  items,
  render,
  empty,
}: {
  title: string;
  icon: typeof Users;
  items: RecordItem[];
  render: (item: RecordItem) => ReactNode;
  empty: string;
}) {
  return (
    <article className="ds-panel min-w-0 p-5 sm:p-6">
      <div className="relative z-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] text-[var(--ds-gold)]">
            <Icon size={16} />
          </span>
          <h2 className="text-base">{title}</h2>
        </div>
        {items.length ? (
          <div className="divide-y divide-[var(--ds-border-soft)]">
            {items.map((item, index) => (
              <div
                key={String(item._id ?? item.id ?? index)}
                className="py-3 first:pt-0 last:pb-0"
              >
                {render(item)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--ds-muted)]">{empty}</p>
        )}
      </div>
    </article>
  );
}

function MetricsPage() {
  const query = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => apiRequest<ApiResult<AdminMetrics>>('/admin/metrics'),
  });

  if (query.isPending)
    return (
      <div className="ds-panel p-7">
        <p role="status" className="text-sm text-[var(--ds-muted)]">
          Loading analytics…
        </p>
      </div>
    );

  if (query.isError)
    return (
      <div className="ds-panel p-7">
        <p role="alert" className="text-sm text-red-400">
          {message(query.error)}
        </p>
      </div>
    );

  const data = query.data.data;
  const practice = data.practice ?? {};
  const revenue = data.revenue ?? {};
  const sessions = Number(practice.sessions ?? 0);
  const completed = Number(practice.completed ?? 0);
  const completionRate =
    sessions > 0 ? Math.round((completed / sessions) * 100) : 0;
  const totalMantras =
    Number(data.freeMantras ?? 0) + Number(data.paidMantras ?? 0);
  const publishedRatio =
    Number(data.products ?? 0) > 0
      ? Math.round(
          (Number(data.publishedProducts ?? 0) / Number(data.products ?? 1)) *
            100
        )
      : 0;
  const netRevenue =
    Number(revenue.capturedRevenuePaise ?? 0) -
    Number(revenue.refundedPaise ?? 0);

  return (
    <section>
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="ds-eyebrow mb-3">Platform intelligence</p>
          <h1 className="text-3xl sm:text-4xl">Analytics</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ds-muted)]">
            A live operational view of accounts, Sadhana activity, devotional
            content and verified digital commerce.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/content" className={secondaryButtonClass}>
            <BookOpen size={14} />
            Manage mantras
          </Link>
          <Link to="/admin/products" className={primaryButtonClass}>
            <Plus size={14} />
            Add digital product
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total users"
          value={formatNumber(data.users)}
          note={`${formatNumber(data.newUsers)} new accounts in the last 30 days`}
          icon={Users}
        />
        <MetricCard
          label="Practice sessions"
          value={formatNumber(practice.sessions)}
          note={`${completionRate}% completion · ${formatDuration(practice.durationSeconds)} active practice`}
          icon={Activity}
        />
        <MetricCard
          label="Total chants"
          value={formatNumber(practice.chants)}
          note={`${formatNumber(totalMantras)} mantras currently managed`}
          icon={BookOpen}
        />
        <MetricCard
          label="Net captured revenue"
          value={priceLabel(Math.max(0, netRevenue))}
          note={`${formatNumber(revenue.capturedPayments)} verified captured payments`}
          icon={DollarSign}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="ds-panel p-5 sm:p-6">
          <div className="relative z-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="ds-eyebrow">Practice pulse</p>
                <h2 className="mt-2 text-xl">Sadhana activity</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--ds-border-soft)] px-3 py-1.5 text-[9px] text-[var(--ds-muted)]">
                <Clock size={12} />
                Lifetime totals
              </span>
            </div>
            <div className="mt-7 space-y-6">
              <ProgressLine
                label="Completed sessions"
                value={completed}
                max={Math.max(sessions, 1)}
                caption={`${formatNumber(completed)} / ${formatNumber(sessions)}`}
              />
              <ProgressLine
                label="Premium mantra share"
                value={Number(data.paidMantras ?? 0)}
                max={Math.max(totalMantras, 1)}
                caption={`${formatNumber(data.paidMantras)} premium`}
              />
              <ProgressLine
                label="Published product share"
                value={Number(data.publishedProducts ?? 0)}
                max={Math.max(Number(data.products ?? 0), 1)}
                caption={`${publishedRatio}% live`}
              />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'Practice time',
                  value: formatDuration(practice.durationSeconds),
                  icon: Clock,
                },
                {
                  label: 'Open contacts',
                  value: formatNumber(data.contacts),
                  icon: MessageSquare,
                },
                {
                  label: 'All orders',
                  value: formatNumber(data.orders),
                  icon: ShoppingBag,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4"
                >
                  <Icon size={15} className="mb-3 text-[var(--ds-gold)]" />
                  <p className="text-lg font-semibold text-[var(--ds-text)]">
                    {String(value)}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[var(--ds-muted)]">
                    {String(label)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="ds-panel p-5 sm:p-6">
          <div className="relative z-10">
            <p className="ds-eyebrow">Commerce health</p>
            <h2 className="mt-2 text-xl">Payment & access</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ds-muted)]">
              Paid access is granted only after server-side Razorpay
              verification. Admin reconciliation never trusts the browser.
            </p>
            <div className="mt-6 space-y-3">
              {[
                [
                  'Captured revenue',
                  priceLabel(Number(revenue.capturedRevenuePaise ?? 0)),
                ],
                ['Refunded', priceLabel(Number(revenue.refundedPaise ?? 0))],
                [
                  'Captured payments',
                  formatNumber(revenue.capturedPayments),
                ],
                [
                  'Products published',
                  formatNumber(data.publishedProducts),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] px-4 py-3"
                >
                  <span className="text-[10px] text-[var(--ds-muted)]">
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-[var(--ds-text)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/admin/orders"
              className={`${secondaryButtonClass} mt-5 w-full`}
            >
              Review payment orders
            </Link>
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <RecentList
          title="Recent users"
          icon={Users}
          items={data.recentUsers ?? []}
          empty="No recent accounts."
          render={(item) => (
            <>
              <p className="truncate text-sm font-semibold text-[var(--ds-text)]">
                {String(item.name ?? item.email ?? 'User')}
              </p>
              <p className="mt-1 text-[10px] text-[var(--ds-muted)]">
                {formatDate(item.createdAt)}
              </p>
            </>
          )}
        />
        <RecentList
          title="Recent orders"
          icon={ShoppingBag}
          items={data.recentOrders ?? []}
          empty="No recent orders."
          render={(item) => (
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ds-text)]">
                  {String(item.title ?? 'Order')}
                </p>
                <p className="mt-1 text-[10px] text-[var(--ds-muted)]">
                  {item.amountPaise !== undefined
                    ? priceLabel(Number(item.amountPaise))
                    : formatDate(item.createdAt)}
                </p>
              </div>
              <StatusBadge>{String(item.status ?? 'created')}</StatusBadge>
            </div>
          )}
        />
        <RecentList
          title="Recent messages"
          icon={MessageSquare}
          items={data.recentContacts ?? []}
          empty="No recent contact messages."
          render={(item) => (
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ds-text)]">
                  {String(item.name ?? 'Visitor')}
                </p>
                <p className="mt-1 truncate text-[10px] capitalize text-[var(--ds-muted)]">
                  {String(item.category ?? 'general')}
                </p>
              </div>
              <StatusBadge>{String(item.status ?? 'new')}</StatusBadge>
            </div>
          )}
        />
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  initial,
  required,
  textarea,
  placeholder,
  hint,
  type = 'text',
}: {
  name: string;
  label: string;
  initial: unknown;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'url' | 'number';
}) {
  const id = `admin-field-${name}`;
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-muted)]">
        {label}
        {required ? (
          <span className="ml-1 text-[var(--ds-amber)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          defaultValue={String(initial ?? '')}
          required={required}
          maxLength={6000}
          rows={name === 'description' ? 5 : 4}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          defaultValue={
            Array.isArray(initial)
              ? initial.join(', ')
              : String(initial ?? (name === 'defaultTargets' ? '108' : ''))
          }
          placeholder={placeholder}
          maxLength={type === 'number' ? undefined : 1000}
          className={inputClass}
        />
      )}
      {hint ? (
        <span className="mt-2 block text-[9px] leading-4 text-[var(--ds-muted-soft)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function ContentEditor({
  section,
  initial,
  onSaved,
  onCancel,
}: {
  section: string;
  initial: RecordItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const product = section === 'products';
  const [access, setAccess] = useState(String(initial?.accessType ?? 'free'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();
    const array = (key: string) =>
      text(key)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    try {
      const shared = {
        title: text('title'),
        slug: text('slug'),
        accessType: access,
        pricePaise: access === 'paid' ? parseRupees(text('price')) : 0,
      };

      const data = product
        ? {
            ...shared,
            description: text('description'),
            shortDescription: text('shortDescription'),
            coverImage: text('coverImage') || null,
            published: form.get('published') === 'on',
            featured: form.get('featured') === 'on',
          }
        : {
            ...shared,
            sanskrit: text('sanskrit'),
            transliteration: text('transliteration'),
            meaning: text('meaning'),
            description: text('description') || null,
            deity: text('deity') || null,
            image: text('image') || null,
            categories: array('categories'),
            benefits: array('benefits'),
            defaultTargets: array('defaultTargets')
              .map(Number)
              .filter((value) => Number.isFinite(value)),
            estimatedSecondsPerChant: text('estimatedSecondsPerChant')
              ? Number(text('estimatedSecondsPerChant'))
              : null,
            isPublished: form.get('published') === 'on',
          };

      await apiRequest(`/admin/${section}${initial ? `/${initial._id}` : ''}`, {
        method: initial ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      });
      onSaved();
    } catch (failure) {
      setError(message(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="ds-panel mb-6 overflow-visible p-5 sm:p-7">
      <div className="relative z-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="ds-eyebrow">
              {initial ? 'Edit existing' : 'Create new'}
            </p>
            <h2 className="mt-2 text-2xl">
              {initial ? 'Edit' : 'Create'} {product ? 'product' : 'mantra'}
            </h2>
            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-[var(--ds-muted)]">
              {product
                ? 'Create the product metadata first, upload the private PDF, then publish it when the file is ready.'
                : 'All existing V1 mantras remain free unless you explicitly choose premium access.'}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="flex size-10 shrink-0 items-center justify-center self-end rounded-xl border border-[var(--ds-border-soft)] text-[var(--ds-muted)] sm:self-auto"
            aria-label="Cancel editor"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4 sm:p-5">
              <h3 className="mb-5 text-sm">Core information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  name="title"
                  label="Title"
                  initial={initial?.title}
                  required
                  placeholder={
                    product
                      ? 'e.g. Hanuman Chalisa Guide'
                      : 'e.g. Maha Mrityunjaya Mantra'
                  }
                />
                <Field
                  name="slug"
                  label="URL slug"
                  initial={initial?.slug}
                  required
                  placeholder="lowercase-hyphenated-slug"
                  hint="Use lowercase letters, numbers and hyphens only."
                />
              </div>

              {product ? (
                <div className="mt-4 grid gap-4">
                  <Field
                    name="shortDescription"
                    label="Short description"
                    initial={initial?.shortDescription}
                    required
                    placeholder="A concise storefront summary."
                  />
                  <Field
                    name="description"
                    label="Full description"
                    initial={initial?.description}
                    required
                    textarea
                    placeholder="Describe what this devotional resource contains."
                  />
                  <Field
                    name="coverImage"
                    label="Cover image URL"
                    initial={initial?.coverImage}
                    type="url"
                    placeholder="https://..."
                    hint="Optional. Leave empty to use DevSangam's built-in placeholder."
                  />
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  <Field
                    name="sanskrit"
                    label="Sanskrit"
                    initial={initial?.sanskrit}
                    required
                    textarea
                    placeholder="मन्त्र…"
                  />
                  <Field
                    name="transliteration"
                    label="Transliteration"
                    initial={initial?.transliteration}
                    required
                    textarea
                    placeholder="Roman transliteration"
                  />
                  <Field
                    name="meaning"
                    label="Meaning"
                    initial={initial?.meaning}
                    required
                    textarea
                    placeholder="Meaning and respectful context"
                  />
                  <Field
                    name="description"
                    label="Description"
                    initial={initial?.description}
                    textarea
                    placeholder="Optional longer description"
                  />
                </div>
              )}
            </section>

            {!product ? (
              <section className="rounded-2xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4 sm:p-5">
                <h3 className="mb-5 text-sm">Practice metadata</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    name="deity"
                    label="Deity"
                    initial={initial?.deity}
                    placeholder="Optional"
                  />
                  <Field
                    name="image"
                    label="Image URL"
                    initial={initial?.image}
                    type="url"
                    placeholder="https://..."
                  />
                  <Field
                    name="categories"
                    label="Categories"
                    initial={initial?.categories}
                    placeholder="Shiva, Healing, Morning"
                    hint="Comma separated."
                  />
                  <Field
                    name="benefits"
                    label="Benefits"
                    initial={initial?.benefits}
                    placeholder="Focus, Devotion"
                    hint="Comma separated. Avoid unsupported guarantees."
                  />
                  <Field
                    name="defaultTargets"
                    label="Default targets"
                    initial={initial?.defaultTargets}
                    required
                    placeholder="108, 216, 1008"
                    hint="Comma separated positive chant counts."
                  />
                  <Field
                    name="estimatedSecondsPerChant"
                    label="Seconds per chant"
                    initial={initial?.estimatedSecondsPerChant}
                    type="number"
                    placeholder="Optional"
                  />
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] text-[var(--ds-amber)]">
                  <Lock size={16} />
                </span>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--ds-gold)]">
                    Access control
                  </p>
                  <h3 className="mt-1 text-sm">Free or premium</h3>
                </div>
              </div>
              <label htmlFor="admin-access" className="mt-5 block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-muted)]">
                  Access type
                </span>
                <select
                  id="admin-access"
                  className={inputClass}
                  value={access}
                  onChange={(event) => setAccess(event.target.value)}
                >
                  <option value="free">Free access</option>
                  <option value="paid">Premium / paid</option>
                </select>
              </label>

              {access === 'paid' ? (
                <label htmlFor="admin-price" className="mt-4 block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-muted)]">
                    Price (INR)
                  </span>
                  <input
                    id="admin-price"
                    name="price"
                    inputMode="decimal"
                    required
                    defaultValue={Number(initial?.pricePaise ?? 0) / 100}
                    className={inputClass}
                  />
                  <span className="mt-2 block text-[9px] leading-4 text-[var(--ds-muted-soft)]">
                    The server stores the canonical amount in paise. Checkout
                    never trusts a browser-supplied amount.
                  </span>
                </label>
              ) : (
                <p className="mt-4 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3 text-[10px] leading-5 text-[var(--ds-muted)]">
                  Free content remains available without a payment entitlement.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4 sm:p-5">
              <h3 className="text-sm">Publishing</h3>
              <div className="mt-4 space-y-3">
                <label className="flex items-start gap-3 rounded-xl border border-[var(--ds-border-soft)] p-3">
                  <input
                    name="published"
                    type="checkbox"
                    disabled={product && !initial?.hasFile}
                    defaultChecked={Boolean(
                      initial?.[product ? 'published' : 'isPublished'] ?? !product
                    )}
                    className="mt-0.5 size-4 accent-[var(--ds-amber)]"
                  />
                  <span>
                    <span className="block text-[11px] font-semibold text-[var(--ds-text)]">
                      Published
                    </span>
                    <span className="mt-1 block text-[9px] leading-4 text-[var(--ds-muted)]">
                      Make this {product ? 'resource' : 'mantra'} visible to
                      users.
                    </span>
                  </span>
                </label>
                {product ? (
                  <label className="flex items-start gap-3 rounded-xl border border-[var(--ds-border-soft)] p-3">
                    <input
                      name="featured"
                      type="checkbox"
                      defaultChecked={Boolean(initial?.featured)}
                      className="mt-0.5 size-4 accent-[var(--ds-amber)]"
                    />
                    <span>
                      <span className="block text-[11px] font-semibold text-[var(--ds-text)]">
                        Featured resource
                      </span>
                      <span className="mt-1 block text-[9px] leading-4 text-[var(--ds-muted)]">
                        Give this product higher storefront priority.
                      </span>
                    </span>
                  </label>
                ) : null}
              </div>
              {product && !initial?.hasFile ? (
                <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-5 text-amber-300">
                  <Upload size={14} className="mt-0.5 shrink-0" />
                  Save this product as a draft first. Then upload its PDF from
                  the product list before publishing.
                </div>
              ) : null}
            </section>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-[11px] text-red-300"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className={`${secondaryButtonClass} flex-1`}
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className={`${primaryButtonClass} flex-1`}
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function Detail({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-muted-soft)]">
        {label}
      </dt>
      <dd
        className={`mt-1 break-words text-[11px] leading-5 text-[var(--ds-text)] ${mono ? 'font-mono text-[10px]' : ''}`}
      >
        {children}
      </dd>
    </div>
  );
}

function AdminRecordCard({
  section,
  item,
  busy,
  onEdit,
  onAct,
  setFeedback,
}: {
  section: string;
  item: RecordItem;
  busy: boolean;
  onEdit: (item: RecordItem) => void;
  onAct: (path: string, method?: string, body?: FormData) => Promise<void>;
  setFeedback: (value: string) => void;
}) {
  const editable = section === 'content' || section === 'products';
  const title = String(
    item.title ?? item.name ?? item.email ?? item.action ?? item._id
  );
  const subtitle =
    section === 'content'
      ? String(item.deity ?? item.slug ?? '')
      : section === 'products'
        ? String(item.slug ?? '')
        : section === 'users'
          ? String(item.email ?? '')
          : section === 'orders'
            ? String(item.itemType ?? '')
            : section === 'contact'
              ? String(item.category ?? '')
              : String(item.targetType ?? item.resourceType ?? '');

  const badges: ReactNode[] = [];
  if (item.status !== undefined)
    badges.push(<StatusBadge key="status">{String(item.status)}</StatusBadge>);
  if (item.role !== undefined)
    badges.push(<StatusBadge key="role">{String(item.role)}</StatusBadge>);
  if (item.accessType !== undefined)
    badges.push(
      <StatusBadge key="access">{String(item.accessType)}</StatusBadge>
    );
  if (section === 'content' && item.isPublished !== undefined)
    badges.push(
      <StatusBadge key="published">
        {item.isPublished ? 'published' : 'draft'}
      </StatusBadge>
    );
  if (section === 'products' && item.published !== undefined)
    badges.push(
      <StatusBadge key="published">
        {item.published ? 'published' : 'draft'}
      </StatusBadge>
    );

  return (
    <article className="ds-panel min-w-0 p-4 sm:p-5">
      <div className="relative z-10">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] text-[var(--ds-gold)]">
                {section === 'content' ? (
                  <BookOpen size={17} />
                ) : section === 'products' ? (
                  <FileText size={17} />
                ) : section === 'users' ? (
                  <Users size={17} />
                ) : section === 'orders' ? (
                  <ShoppingBag size={17} />
                ) : section === 'contact' ? (
                  <MessageSquare size={17} />
                ) : section === 'entitlements' ? (
                  <ShieldCheck size={17} />
                ) : (
                  <History size={17} />
                )}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm sm:text-base">{title}</h2>
                {subtitle ? (
                  <p className="mt-1 truncate text-[9px] capitalize text-[var(--ds-muted)]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            {badges.length ? (
              <div className="mt-3 flex flex-wrap gap-2">{badges}</div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {editable ? (
              <>
                <button
                  className={secondaryButtonClass}
                  onClick={() => onEdit(item)}
                >
                  <Edit3 size={13} />
                  Edit
                </button>
                <button
                  className={secondaryButtonClass}
                  disabled={busy}
                  onClick={() => void onAct(`${section}/${item._id}`, 'DELETE')}
                >
                  <EyeOff size={13} />
                  Unpublish
                </button>
              </>
            ) : null}
            {section === 'contact' && item.status === 'new' ? (
              <button
                className={primaryButtonClass}
                disabled={busy}
                onClick={() => void onAct(`contact/${item._id}/review`)}
              >
                <CheckCircle2 size={13} />
                Mark reviewed
              </button>
            ) : null}
            {section === 'entitlements' && item.status === 'active' ? (
              <button
                className={secondaryButtonClass}
                disabled={busy}
                onClick={() => void onAct(`entitlements/${item._id}/revoke`)}
              >
                <Lock size={13} />
                Revoke access
              </button>
            ) : null}
            {section === 'orders' &&
            !['paid', 'refunded'].includes(String(item.status)) ? (
              <button
                className={secondaryButtonClass}
                disabled={busy}
                onClick={() => void onAct(`orders/${item._id}/reconcile`)}
              >
                <RefreshCw size={13} />
                Check payment with Razorpay
              </button>
            ) : null}
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-[var(--ds-border-soft)] pt-4 sm:grid-cols-2 xl:grid-cols-4">
          {section === 'content' ? (
            <>
              <Detail label="Slug">{String(item.slug ?? '—')}</Detail>
              <Detail label="Categories">
                {Array.isArray(item.categories)
                  ? item.categories.join(', ') || '—'
                  : '—'}
              </Detail>
              <Detail label="Price">
                {item.accessType === 'paid'
                  ? priceLabel(Number(item.pricePaise ?? 0))
                  : 'Free'}
              </Detail>
              <Detail label="Default targets">
                {Array.isArray(item.defaultTargets)
                  ? item.defaultTargets.join(', ')
                  : '—'}
              </Detail>
            </>
          ) : null}

          {section === 'products' ? (
            <>
              <Detail label="Price">
                {item.accessType === 'paid'
                  ? priceLabel(Number(item.pricePaise ?? 0))
                  : 'Free'}
              </Detail>
              <Detail label="PDF">
                {item.hasFile ? 'Private PDF uploaded' : 'PDF required'}
              </Detail>
              <Detail label="Featured">
                {item.featured ? 'Yes' : 'No'}
              </Detail>
              <Detail label="Created">{formatDate(item.createdAt)}</Detail>
            </>
          ) : null}

          {section === 'users' ? (
            <>
              <Detail label="Email">{String(item.email ?? '—')}</Detail>
              <Detail label="Role">{String(item.role ?? 'user')}</Detail>
              <Detail label="Joined">{formatDate(item.createdAt)}</Detail>
              <Detail label="User ID" mono>
                {item._id}
              </Detail>
            </>
          ) : null}

          {section === 'orders' ? (
            <>
              <Detail label="Amount">
                {priceLabel(Number(item.amountPaise ?? 0))}
              </Detail>
              <Detail label="Created">{formatDate(item.createdAt)}</Detail>
              <Detail label="Paid">{formatDate(item.paidAt)}</Detail>
              <Detail label="Refunded">
                {priceLabel(Number(item.refundedPaise ?? 0))}
              </Detail>
              <Detail label="Razorpay order" mono>
                {String(item.razorpayOrderId ?? '—')}
              </Detail>
              <Detail label="Razorpay payment" mono>
                {String(item.razorpayPaymentId ?? '—')}
              </Detail>
              <Detail label="User ID" mono>
                {String(item.userId ?? '—')}
              </Detail>
              <Detail label="Resource ID" mono>
                {String(item.itemId ?? '—')}
              </Detail>
            </>
          ) : null}

          {section === 'contact' ? (
            <>
              <Detail label="Email">{String(item.email ?? '—')}</Detail>
              <Detail label="Category">
                {String(item.category ?? 'general')}
              </Detail>
              <Detail label="Received">{formatDate(item.createdAt)}</Detail>
              <Detail label="Message">
                <span className="whitespace-pre-wrap">
                  {String(item.message ?? '—')}
                </span>
              </Detail>
            </>
          ) : null}

          {section === 'entitlements' ? (
            <>
              <Detail label="Resource type">
                {humanize(String(item.resourceType ?? '—'))}
              </Detail>
              <Detail label="Granted">{formatDate(item.grantedAt)}</Detail>
              <Detail label="User ID" mono>
                {String(item.userId ?? '—')}
              </Detail>
              <Detail label="Resource ID" mono>
                {String(item.resourceId ?? '—')}
              </Detail>
            </>
          ) : null}

          {section === 'audit' ? (
            <>
              <Detail label="Action">
                {humanize(String(item.action ?? '—'))}
              </Detail>
              <Detail label="When">{formatDate(item.createdAt)}</Detail>
              <Detail label="Target" mono>
                {String(item.targetId ?? '—')}
              </Detail>
              <Detail label="Admin user" mono>
                {String(item.adminUserId ?? '—')}
              </Detail>
            </>
          ) : null}
        </dl>

        {section === 'products' ? (
          <div className="mt-5 border-t border-[var(--ds-border-soft)] pt-4">
            <label className="flex min-w-0 flex-col gap-3 rounded-xl border border-dashed border-[var(--ds-border-gold)] bg-[var(--ds-amber-03)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-amber-08)] text-[var(--ds-amber)]">
                  <Upload size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold text-[var(--ds-text)]">
                    {item.hasFile ? 'Replace private PDF' : 'Upload private PDF'}
                  </span>
                  <span className="mt-1 block text-[9px] text-[var(--ds-muted)]">
                    PDF only · maximum 20 MB · required before publishing
                  </span>
                </span>
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                disabled={busy}
                className="block w-full min-w-0 text-[10px] text-[var(--ds-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--ds-amber-10)] file:px-3 file:py-2 file:text-[10px] file:font-semibold file:text-[var(--ds-soft-gold)] sm:max-w-[310px]"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 20 * 1024 * 1024) {
                    setFeedback('PDF must be under 20 MB.');
                    event.target.value = '';
                    return;
                  }
                  const form = new FormData();
                  form.append('file', file);
                  void onAct(`products/${item._id}/file`, 'POST', form);
                  event.target.value = '';
                }}
              />
            </label>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CollectionPage({ section }: { section: string }) {
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<RecordItem | null | undefined>();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const cache = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', section, page],
    queryFn: () =>
      apiRequest<ApiResult<PagedItems<RecordItem>>>(
        `/admin/${section}?page=${page}&limit=20`
      ),
  });

  const editable = section === 'content' || section === 'products';
  const copy = SECTION_COPY[section] ?? SECTION_COPY.audit;
  const SectionIcon = copy.icon;

  async function act(path: string, method = 'POST', body?: FormData) {
    setBusy(true);
    setFeedback('');
    try {
      await apiRequest(`/admin/${path}`, {
        method,
        ...(body ? { body } : {}),
      });
      await cache.invalidateQueries({ queryKey: ['admin'] });
      setFeedback('Saved successfully.');
    } catch (failure) {
      setFeedback(message(failure));
    } finally {
      setBusy(false);
    }
  }

  const items = query.data?.data.items ?? [];
  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [
        item.title,
        item.name,
        item.email,
        item.slug,
        item.status,
        item.role,
        item.category,
        item.action,
        item.userId,
        item.razorpayOrderId,
        item.razorpayPaymentId,
      ]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [items, search]);

  const title = section === 'content' ? 'Mantras' : section;

  return (
    <section>
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="ds-eyebrow mb-3">{copy.eyebrow}</p>
          <h1 className="text-3xl capitalize sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ds-muted)]">
            {copy.description}
          </p>
        </div>
        {editable ? (
          <button
            className={primaryButtonClass}
            onClick={() => setEditor(null)}
          >
            <Plus size={14} />
            Create {section === 'products' ? 'product' : 'mantra'}
          </button>
        ) : null}
      </div>

      {editor !== undefined ? (
        <ContentEditor
          key={editor?._id ?? 'new'}
          section={section}
          initial={editor}
          onCancel={() => setEditor(undefined)}
          onSaved={() => {
            setEditor(undefined);
            void cache.invalidateQueries({ queryKey: ['admin'] });
          }}
        />
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative block">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ds-muted)]"
          />
          <input
            aria-label="Search current page"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${section === 'content' ? 'mantras' : section} on this page…`}
            className="min-h-11 w-full rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-night)] pl-10 pr-3 text-sm text-[var(--ds-text)] outline-none focus:border-[var(--ds-border-gold)]"
          />
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] px-4 py-2 text-[10px] text-[var(--ds-muted)]">
          <SectionIcon size={14} className="text-[var(--ds-gold)]" />
          {query.data
            ? `${formatNumber(query.data.data.total)} total records`
            : 'Loading records'}
        </div>
      </div>

      {feedback ? (
        <p
          role="status"
          className={`mb-5 rounded-xl border p-3 text-[11px] ${
            feedback === 'Saved successfully.'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
          }`}
        >
          {feedback}
        </p>
      ) : null}

      {query.isPending ? (
        <div className="ds-panel p-7">
          <p role="status" className="text-sm text-[var(--ds-muted)]">
            Loading…
          </p>
        </div>
      ) : query.isError ? (
        <div className="ds-panel p-7">
          <p role="alert" className="text-sm text-red-400">
            {message(query.error)}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="ds-panel p-8 text-center sm:p-12">
          <PackageOpen
            size={26}
            className="mx-auto text-[var(--ds-gold)]"
          />
          <h2 className="mt-4 text-lg">
            {search ? 'No matching records' : 'No records yet'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ds-muted)]">
            {search
              ? 'Try a different search for the records loaded on this page.'
              : editable
                ? `Create the first ${section === 'products' ? 'digital product' : 'mantra'} from this workspace.`
                : 'Records will appear here when they are available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <AdminRecordCard
              key={item._id}
              section={section}
              item={item}
              busy={busy}
              onEdit={setEditor}
              onAct={act}
              setFeedback={setFeedback}
            />
          ))}
        </div>
      )}

      {query.data ? (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[var(--ds-muted)]">
            Page {page} · showing up to {query.data.data.limit} records
          </p>
          <div className="flex gap-2">
            <button
              className={secondaryButtonClass}
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <button
              className={secondaryButtonClass}
              disabled={page * 20 >= query.data.data.total}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {section === 'entitlements' ? (
        <div className="mt-5 flex gap-3 rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] p-4 text-[10px] leading-5 text-[var(--ds-muted)]">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-[var(--ds-gold)]"
          />
          <p>
            Paid access is created automatically after a verified captured
            Razorpay payment. Revoking an entitlement removes access without
            falsifying payment history.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function AdminPage() {
  const { section = 'analytics' } = useParams();
  if (section === 'analytics') return <MetricsPage />;
  if (
    ![
      'content',
      'products',
      'users',
      'orders',
      'contact',
      'entitlements',
      'audit',
    ].includes(section)
  )
    return (
      <div className="ds-panel p-8">
        <h1 className="text-2xl">Section not found</h1>
      </div>
    );
  return <CollectionPage key={section} section={section} />;
}
