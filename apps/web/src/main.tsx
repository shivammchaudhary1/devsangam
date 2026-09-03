import '@/index.css';
import App from '@/App';
import { queryClient } from '@/app/query-client';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { ThemeProvider } from '@/features/theme/context/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
