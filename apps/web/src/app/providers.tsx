'use client';

import { createQueryClient } from './query-client';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { PwaUpdateManager } from '@/components/pwa/PwaUpdateManager';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { PushSubscriptionManager } from '@/features/push/components/PushSubscriptionManager';
import { ThemeProvider } from '@/features/theme/context/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // A new query cache for each SSR render; never share account state between requests.
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <PwaUpdateManager />
            <PushSubscriptionManager />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
