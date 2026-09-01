import type {
  ToastApi,
  ToastId,
  ToastItem,
  ToastOptions,
  ToastVariant,
} from './toast.types';
import { ToastContext } from './toast-context';
import { ToastViewport } from './ToastViewport';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

const DEFAULT_TOAST_DURATION = 4000;
const MAX_VISIBLE_TOASTS = 4;

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const idCounter = useRef(0);

  const timeoutIds = useRef(new Map<ToastId, number>());

  const clearToastTimeout = useCallback((id: ToastId) => {
    const timeout = timeoutIds.current.get(id);

    if (timeout === undefined) {
      return;
    }

    window.clearTimeout(timeout);
    timeoutIds.current.delete(id);
  }, []);

  const dismiss = useCallback(
    (id: ToastId) => {
      clearToastTimeout(id);

      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [clearToastTimeout]
  );

  const dismissAll = useCallback(() => {
    for (const timeout of timeoutIds.current.values()) {
      window.clearTimeout(timeout);
    }

    timeoutIds.current.clear();
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (variant: ToastVariant, message: string, options: ToastOptions = {}) => {
      idCounter.current += 1;

      const id = `toast-${Date.now()}-${idCounter.current}`;

      const duration = options.duration ?? DEFAULT_TOAST_DURATION;

      const persistent = options.persistent ?? false;

      const toast: ToastItem = {
        id,
        message,
        variant,
        duration,
        persistent,
      };

      setToasts((current) => {
        const next = [...current, toast];

        if (next.length <= MAX_VISIBLE_TOASTS) {
          return next;
        }

        const removed = next.slice(0, next.length - MAX_VISIBLE_TOASTS);

        for (const item of removed) {
          clearToastTimeout(item.id);
        }

        return next.slice(-MAX_VISIBLE_TOASTS);
      });

      if (!persistent) {
        const timeout = window.setTimeout(
          () => {
            dismiss(id);
          },
          Math.max(1000, duration)
        );

        timeoutIds.current.set(id, timeout);
      }

      return id;
    },
    [clearToastTimeout, dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => addToast('success', message, options),

      error: (message, options) => addToast('error', message, options),

      warning: (message, options) => addToast('warning', message, options),

      info: (message, options) => addToast('info', message, options),

      dismiss,
      dismissAll,
    }),
    [addToast, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
