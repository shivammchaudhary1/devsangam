import { parseRupees, priceLabel } from '@/features/store/commerce.utils';
import { apiRequest } from '@/services/api/client';
import type { ApiResult, PagedItems } from '@devsangam/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { useParams } from 'react-router';

type RecordItem = Record<string, unknown> & { _id: string };
const fieldClass =
  'mt-1 w-full rounded-lg border border-border bg-background p-3';
const buttonClass =
  'rounded-lg border border-border px-4 py-2 disabled:opacity-50';
const listFields = [
  'title',
  'name',
  'email',
  'category',
  'message',
  'role',
  'status',
  'action',
  'targetType',
  'targetId',
  'resourceType',
  'resourceId',
  'userId',
  'createdAt',
  'itemType',
  'itemId',
  'razorpayOrderId',
  'razorpayPaymentId',
  'paidAt',
  'refundedPaise',
];
function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The request could not be completed.';
}

function MetricsPage() {
  const query = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () =>
      apiRequest<ApiResult<Record<string, unknown>>>('/admin/metrics'),
  });
  if (query.isPending) return <p role="status">Loading analytics…</p>;
  if (query.isError) return <p role="alert">{message(query.error)}</p>;
  return (
    <section>
      <h1 className="mb-6 font-display text-3xl">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(query.data.data)
          .filter(([key]) => !key.startsWith('recent'))
          .map(([key, value]) => (
            <article
              key={key}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h2 className="mb-3 font-semibold capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </h2>
              {typeof value === 'object' && value !== null ? (
                <dl>
                  {Object.entries(value)
                    .filter(([label]) => label !== '_id')
                    .map(([label, number]) => (
                      <div
                        key={label}
                        className="mb-2 flex flex-wrap justify-between gap-2"
                      >
                        <dt className="capitalize">
                          {label.replace(/([A-Z])/g, ' $1')}
                        </dt>
                        <dd>
                          {label.toLowerCase().includes('paise')
                            ? priceLabel(Number(number))
                            : String(number ?? 0)}
                        </dd>
                      </div>
                    ))}
                </dl>
              ) : (
                <p className="text-2xl">{String(value ?? 0)}</p>
              )}
            </article>
          ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {Object.entries(query.data.data)
          .filter(([key]) => key.startsWith('recent'))
          .map(([key, items]) => (
            <article key={key} className="rounded-xl border border-border p-5">
              <h2 className="mb-3 font-semibold">
                {key.replace(/([A-Z])/g, ' $1')}
              </h2>
              {Array.isArray(items) && items.length ? (
                items.map((item: RecordItem) => (
                  <p key={item._id} className="mb-3 break-words text-sm">
                    {String(
                      item.title ??
                        item.name ??
                        item.email ??
                        item.category ??
                        item._id
                    )}
                  </p>
                ))
              ) : (
                <p>No recent activity.</p>
              )}
            </article>
          ))}
      </div>
    </section>
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
            defaultTargets: array('defaultTargets').map(Number),
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
  const fields = product
    ? ['title', 'slug', 'shortDescription', 'description', 'coverImage']
    : [
        'title',
        'slug',
        'sanskrit',
        'transliteration',
        'meaning',
        'description',
        'deity',
        'image',
        'categories',
        'benefits',
        'defaultTargets',
        'estimatedSecondsPerChant',
      ];
  return (
    <form
      onSubmit={save}
      className="mb-6 space-y-4 rounded-xl border border-border p-5"
    >
      <h2 className="text-xl">
        {initial ? 'Edit' : 'Create'} {product ? 'product' : 'mantra'}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((key) => (
          <label key={key} className="block text-sm capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
            {['description', 'meaning', 'sanskrit', 'transliteration'].includes(
              key
            ) ? (
              <textarea
                name={key}
                defaultValue={String(initial?.[key] ?? '')}
                maxLength={6000}
                className={fieldClass}
                rows={4}
              />
            ) : (
              <input
                name={key}
                required={[
                  'title',
                  'slug',
                  'shortDescription',
                  'defaultTargets',
                ].includes(key)}
                defaultValue={
                  Array.isArray(initial?.[key])
                    ? (initial![key] as unknown[]).join(', ')
                    : String(
                        initial?.[key] ??
                          (key === 'defaultTargets' ? '108' : '')
                      )
                }
                maxLength={1000}
                className={fieldClass}
              />
            )}
          </label>
        ))}
      </div>
      {!product && (
        <p className="text-sm text-muted-foreground">
          Separate categories, benefits and chant targets with commas.
        </p>
      )}
      <label className="block">
        Access
        <select
          className={fieldClass}
          value={access}
          onChange={(event) => setAccess(event.target.value)}
        >
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </label>
      {access === 'paid' && (
        <label className="block">
          Price (INR)
          <input
            name="price"
            inputMode="decimal"
            required
            defaultValue={Number(initial?.pricePaise ?? 0) / 100}
            className={fieldClass}
          />
        </label>
      )}
      <label className="flex gap-2">
        <input
          name="published"
          type="checkbox"
          disabled={product && !initial?.hasFile}
          defaultChecked={Boolean(
            initial?.[product ? 'published' : 'isPublished'] ?? !product
          )}
        />
        Published
      </label>
      {product && (
        <>
          <label className="flex gap-2">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={Boolean(initial?.featured)}
            />
            Featured
          </label>
          {!initial?.hasFile && (
            <p className="text-sm">
              Save a draft, upload its PDF, then edit to publish.
            </p>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button disabled={busy} className={buttonClass}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={buttonClass}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CollectionPage({ section }: { section: string }) {
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<RecordItem | null | undefined>();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', section, page],
    queryFn: () =>
      apiRequest<ApiResult<PagedItems<RecordItem>>>(
        `/admin/${section}?page=${page}&limit=20`
      ),
  });
  const editable = section === 'content' || section === 'products';
  async function act(path: string, method = 'POST', body?: FormData) {
    setBusy(true);
    setFeedback('');
    try {
      await apiRequest(`/admin/${path}`, { method, ...(body ? { body } : {}) });
      await cache.invalidateQueries({ queryKey: ['admin'] });
      setFeedback('Saved successfully.');
    } catch (failure) {
      setFeedback(message(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl capitalize">
          {section === 'content' ? 'Mantras' : section}
        </h1>
        {editable && (
          <button className={buttonClass} onClick={() => setEditor(null)}>
            Create {section === 'products' ? 'product' : 'mantra'}
          </button>
        )}
      </div>
      {editor !== undefined && (
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
      )}
      {feedback && (
        <p role="status" className="mb-4">
          {feedback}
        </p>
      )}
      {query.isPending ? (
        <p role="status">Loading…</p>
      ) : query.isError ? (
        <p role="alert">{message(query.error)}</p>
      ) : (
        <>
          <div className="space-y-4">
            {query.data.data.items.length === 0 && <p>No records yet.</p>}
            {query.data.data.items.map((item) => (
              <article
                key={item._id}
                className="min-w-0 rounded-xl border border-border bg-card p-5"
              >
                <dl className="space-y-2">
                  {listFields
                    .filter((key) => item[key] !== undefined)
                    .map((key) => (
                      <div key={key} className="break-words">
                        <dt className="inline font-semibold capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}:{' '}
                        </dt>
                        <dd className="inline whitespace-pre-wrap">
                          {String(item[key])}
                        </dd>
                      </div>
                    ))}
                  {item.pricePaise !== undefined && (
                    <div>Price: {priceLabel(Number(item.pricePaise))}</div>
                  )}
                  {item.amountPaise !== undefined && (
                    <div>Amount: {priceLabel(Number(item.amountPaise))}</div>
                  )}
                </dl>
                <div className="mt-4 flex flex-wrap gap-3">
                  {editable && (
                    <>
                      <button
                        className={buttonClass}
                        onClick={() => setEditor(item)}
                      >
                        Edit
                      </button>
                      <button
                        className={buttonClass}
                        disabled={busy}
                        onClick={() =>
                          void act(`${section}/${item._id}`, 'DELETE')
                        }
                      >
                        Unpublish
                      </button>
                    </>
                  )}
                  {section === 'products' && (
                    <label className={`${buttonClass} w-full max-w-sm min-w-0`}>
                      Upload PDF (up to 20 MB)
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        disabled={busy}
                        className="mt-2 block w-full min-w-0 text-sm"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (file.size > 20 * 1024 * 1024) {
                            setFeedback('PDF must be under 20 MB.');
                            return;
                          }
                          const form = new FormData();
                          form.append('file', file);
                          void act(`products/${item._id}/file`, 'POST', form);
                          event.target.value = '';
                        }}
                      />
                      <span className="mt-2 block text-sm">
                        {item.hasFile ? 'PDF uploaded' : 'No PDF uploaded'}
                      </span>
                    </label>
                  )}
                  {section === 'contact' && item.status === 'new' && (
                    <button
                      className={buttonClass}
                      disabled={busy}
                      onClick={() => void act(`contact/${item._id}/review`)}
                    >
                      Mark reviewed
                    </button>
                  )}
                  {section === 'entitlements' && item.status === 'active' && (
                    <button
                      className={buttonClass}
                      disabled={busy}
                      onClick={() =>
                        void act(`entitlements/${item._id}/revoke`)
                      }
                    >
                      Revoke access
                    </button>
                  )}
                  {section === 'orders' &&
                    !['paid', 'refunded'].includes(String(item.status)) && (
                      <button
                        className={buttonClass}
                        disabled={busy}
                        onClick={() => void act(`orders/${item._id}/reconcile`)}
                      >
                        Check payment with Razorpay
                      </button>
                    )}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button
              className={buttonClass}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              className={buttonClass}
              disabled={page * 20 >= query.data.data.total}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
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
    return <h1>Section not found</h1>;
  return <CollectionPage key={section} section={section} />;
}
