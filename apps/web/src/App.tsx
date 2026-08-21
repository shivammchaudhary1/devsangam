// import { Route, Routes } from 'react-router';

// import { AppShell } from '@/components/layout/AppShell';
// import { PlaceholderPage } from '@/components/shared/PlaceholderPage';

// import { GuestRoute } from '@/features/auth/components/GuestRoute';
// import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
// import { LoginPage } from '@/features/auth/pages/LoginPage';
// import { RegisterPage } from '@/features/auth/pages/RegisterPage';
// import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

// import { MantraLibraryPage } from '@/features/mantras/pages/MantraLibraryPage';

// import { ProfilePage } from '@/features/profile/pages/ProfilePage';

// function App() {
//   return (
//     <Routes>
//       {/* ======================== */}
//       {/* Guest Routes */}
//       {/* ======================== */}

//       <Route element={<GuestRoute />}>
//         <Route path="/auth/login" element={<LoginPage />} />

//         <Route path="/auth/register" element={<RegisterPage />} />

//         <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
//       </Route>

//       <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

//       {/* ======================== */}
//       {/* Authenticated App */}
//       {/* ======================== */}

//       <Route element={<ProtectedRoute />}>
//         <Route element={<AppShell />}>
//           {/* Dashboard */}
//           <Route
//             path="/"
//             element={
//               <PlaceholderPage
//                 title="Dashboard"
//                 description="Your daily spiritual practice."
//               />
//             }
//           />

//           {/* Practice */}
//           <Route
//             path="/practice"
//             element={
//               <PlaceholderPage
//                 title="Start Practice"
//                 description="Choose a mantra and begin your Sadhana."
//               />
//             }
//           />

//           {/* Insights */}
//           <Route
//             path="/insights"
//             element={
//               <PlaceholderPage
//                 title="Insights & Progress"
//                 description="Track consistency and chanting progress."
//               />
//             }
//           />

//           {/* Mantra Library */}
//           <Route path="/library" element={<MantraLibraryPage />} />

//           {/* Profile */}
//           <Route path="/profile" element={<ProfilePage />} />
//         </Route>
//       </Route>
//     </Routes>
//   );
// }

// export default App;

import { lazy, Suspense } from 'react';

import { Route, Routes } from 'react-router';

import { APP_ROUTES } from '@/app/constants/routes.constants';

import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { RouteLoadingFallback } from '@/components/shared/RouteLoadingFallback';

import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

const AppShell = lazy(() =>
  import('@/components/layout/AppShell').then((module) => ({
    default: module.AppShell,
  }))
);

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);

const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);

const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);

const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  }))
);

const MantraLibraryPage = lazy(() =>
  import('@/features/mantras/pages/MantraLibraryPage').then((module) => ({
    default: module.MantraLibraryPage,
  }))
);

const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);

function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path={APP_ROUTES.auth.login} element={<LoginPage />} />

          <Route path={APP_ROUTES.auth.register} element={<RegisterPage />} />

          <Route
            path={APP_ROUTES.auth.forgotPassword}
            element={<ForgotPasswordPage />}
          />
        </Route>

        <Route
          path={APP_ROUTES.auth.resetPassword}
          element={<ResetPasswordPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route
              path={APP_ROUTES.home}
              element={
                <PlaceholderPage
                  title="Dashboard"
                  description="Your daily spiritual practice."
                />
              }
            />

            <Route
              path={APP_ROUTES.practice}
              element={
                <PlaceholderPage
                  title="Start Practice"
                  description="Choose a mantra and begin your Sadhana."
                />
              }
            />

            <Route
              path={APP_ROUTES.insights}
              element={
                <PlaceholderPage
                  title="Insights & Progress"
                  description="Track consistency and chanting progress."
                />
              }
            />

            <Route path={APP_ROUTES.library} element={<MantraLibraryPage />} />

            <Route path={APP_ROUTES.profile} element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
