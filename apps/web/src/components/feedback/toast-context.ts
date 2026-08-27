import type { ToastApi } from './toast.types';
import { createContext } from 'react';

export const ToastContext = createContext<ToastApi | null>(null);
