'use client';

import { adminSecondaryButton } from './admin.styles';
import { Trash2 } from 'lucide-react';
import { AlertDialog } from 'radix-ui';

export function ConfirmDeleteDialog({
  title,
  product,
  busy,
  error,
  onCancel,
  onConfirm,
  onRestoreFocus,
}: {
  title: string | null;
  product: boolean;
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
  onRestoreFocus: () => void;
}) {
  return (
    <AlertDialog.Root
      open={title !== null}
      onOpenChange={(open) => {
        if (!open && !busy) onCancel();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" />
        <AlertDialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onRestoreFocus();
          }}
          className="fixed left-1/2 top-1/2 z-[81] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)] p-6 shadow-2xl"
        >
          <span className="mb-5 flex size-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
            <Trash2 size={19} />
          </span>
          <AlertDialog.Title className="font-serif text-xl text-[var(--ds-text)]">
            {product ? 'Unpublish resource?' : 'Delete mantra?'}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-sm leading-6 text-[var(--ds-muted)]">
            “{title}” will be removed from the public library.{' '}
            {product
              ? 'Purchase history remains intact.'
              : 'Practice history and purchases stay intact. You can restore it from Archived mantras.'}
          </AlertDialog.Description>
          {error && (
            <p role="alert" className="mt-4 text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel disabled={busy} className={adminSecondaryButton}>
              Cancel
            </AlertDialog.Cancel>
            <button
              disabled={busy}
              onClick={onConfirm}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {busy ? 'Removing…' : product ? 'Confirm unpublish' : 'Confirm delete'}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
