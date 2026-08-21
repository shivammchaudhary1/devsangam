import { Route, Routes } from 'react-router';

import { AppShell } from '@/components/layout/AppShell';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';

import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

import { MantraLibraryPage } from '@/features/mantras/pages/MantraLibraryPage';

import { ProfilePage } from '@/features/profile/pages/ProfilePage';

function App() {
  return (
    <Routes>
      {/* ======================== */}
      {/* Guest Routes */}
      {/* ======================== */}

      <Route element={<GuestRoute />}>
        <Route path="/auth/login" element={<LoginPage />} />

        <Route path="/auth/register" element={<RegisterPage />} />

        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      {/* ======================== */}
      {/* Authenticated App */}
      {/* ======================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {/* Dashboard */}
          <Route
            path="/"
            element={
              <PlaceholderPage
                title="Dashboard"
                description="Your daily spiritual practice."
              />
            }
          />

          {/* Practice */}
          <Route
            path="/practice"
            element={
              <PlaceholderPage
                title="Start Practice"
                description="Choose a mantra and begin your Sadhana."
              />
            }
          />

          {/* Insights */}
          <Route
            path="/insights"
            element={
              <PlaceholderPage
                title="Insights & Progress"
                description="Track consistency and chanting progress."
              />
            }
          />

          {/* Mantra Library */}
          <Route path="/library" element={<MantraLibraryPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
