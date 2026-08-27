import type { ToastId, ToastItem as ToastItemData } from './toast.types';
import { ToastItem } from './ToastItem';

type ToastViewportProps = {
  toasts: ToastItemData[];
  onDismiss: (id: ToastId) => void;
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions removals"
      className={[
        'pointer-events-none fixed inset-x-3 bottom-[92px] z-[100]',
        'flex flex-col gap-2',
        'sm:left-auto sm:right-4 sm:w-[360px]',
        'md:bottom-5 md:right-5',
      ].join(' ')}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
