import { Route, Routes } from 'react-router';

import { AppShell } from '@/components/layout/AppShell';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';

import { LoginPage } from '@/features/auth/pages/LoginPage';

import { RegisterPage } from '@/features/auth/pages/RegisterPage';

import { GuestRoute } from '@/features/auth/components/GuestRoute';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';

import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

function App() {
  return (
    <Routes>
      {/* Guest-only */}
      <Route element={<GuestRoute />}>
        <Route path="/auth/login" element={<LoginPage />} />

        <Route path="/auth/register" element={<RegisterPage />} />

        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {/* existing app routes */}

          <Route
            path="/"
            element={
              <PlaceholderPage
                title="Dashboard"
                description="Your daily spiritual practice."
              />
            }
          />

          <Route
            path="/practice"
            element={
              <PlaceholderPage
                title="Start Practice"
                description="Choose a mantra and begin your Sadhana."
              />
            }
          />

          <Route
            path="/insights"
            element={
              <PlaceholderPage
                title="Insights & Progress"
                description="Track consistency and chanting progress."
              />
            }
          />

          <Route
            path="/library"
            element={
              <PlaceholderPage
                title="Sadhana Library"
                description="Explore sacred mantras."
              />
            }
          />

          <Route
            path="/profile"
            element={
              <PlaceholderPage
                title="Profile"
                description="Manage your DevSangam experience."
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
