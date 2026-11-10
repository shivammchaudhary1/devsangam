'use client';

import { MantraImage } from '@/components/shared/MantraImage';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MantraImagePicker({
  current,
  file,
  onChange,
}: {
  current?: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  return (
    <section className="rounded-2xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm">Mantra artwork</h3>
        <ImagePlus size={17} className="text-[var(--ds-gold)]" />
      </div>
      <MantraImage
        src={file ? preview : current}
        alt="Mantra image preview"
        className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl object-cover"
      />
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 py-4 text-xs font-semibold text-[var(--ds-text)] focus-within:ring-2 focus-within:ring-[var(--ds-border-gold)]">
        <ImagePlus size={16} />
        Choose image
        <input
          aria-label="Upload mantra image"
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            setError('');
            if (!chosen) return;
            if (
              !['image/jpeg', 'image/png', 'image/webp'].includes(chosen.type) ||
              chosen.size > 5 * 1024 * 1024
            ) {
              setError('Choose a JPEG, PNG or WebP image up to 5 MB.');
              event.target.value = '';
              return;
            }
            setPreview(URL.createObjectURL(chosen));
            onChange(chosen);
          }}
        />
      </label>
      {file && (
        <div className="mt-3 flex min-w-0 items-center justify-between gap-3 text-xs">
          <span className="truncate text-[var(--ds-muted)]">
            {file.name} · {Math.round(file.size / 1024)} KB
          </span>
          <button
            type="button"
            aria-label="Remove selected image"
            onClick={() => {
              onChange(null);
              setPreview('');
            }}
            className="shrink-0 rounded-lg p-2"
          >
            <X size={15} />
          </button>
        </div>
      )}
      <p className="mt-3 text-[10px] leading-5 text-[var(--ds-muted)]">
        Images are resized to fit 1200 px and compressed to WebP before storage. JPEG, PNG or WebP ·
        up to 5 MB.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
