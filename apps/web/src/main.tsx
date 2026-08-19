import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/app/query-client';

import { AuthProvider } from '@/features/auth/context/AuthProvider';
import App from '@/App';

import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
