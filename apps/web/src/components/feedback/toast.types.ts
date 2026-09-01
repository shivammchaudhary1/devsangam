export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastId = string;

export type ToastOptions = {
  duration?: number;
  persistent?: boolean;
};

export type ToastItem = {
  id: ToastId;
  message: string;
  variant: ToastVariant;
  duration: number;
  persistent: boolean;
};

export type ToastInput = {
  message: string;
  variant: ToastVariant;
  options?: ToastOptions;
};

export type ToastApi = {
  success: (message: string, options?: ToastOptions) => ToastId;
  error: (message: string, options?: ToastOptions) => ToastId;
  warning: (message: string, options?: ToastOptions) => ToastId;
  info: (message: string, options?: ToastOptions) => ToastId;
  dismiss: (id: ToastId) => void;
  dismissAll: () => void;
};
