/**
 * Every URL the app answers, in one place.
 *
 * - Pages are lazy-loaded, so each page is its own JS chunk that downloads
 *   only when its URL is visited (the landing page stays small).
 * - Public: /, /login, /signup. Signed-in: /onboarding and /app/* (guarded by
 *   ProtectedRoute, which sends guests to /login?next=…).
 * - /app/* pages render inside DashboardLayout (sidebar, top bar, live feed).
 */

import { lazy, Suspense, type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import LoadingState from '@/components/layout/LoadingState';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'));
const LivePage = lazy(() => import('@/pages/app/LivePage'));
const ThreatsPage = lazy(() => import('@/pages/app/ThreatsPage'));
const BlockedPage = lazy(() => import('@/pages/app/BlockedPage'));
const NotesPage = lazy(() => import('@/pages/app/NotesPage'));
const TeamPage = lazy(() => import('@/pages/app/TeamPage'));
const HistoryPage = lazy(() => import('@/pages/app/HistoryPage'));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'));

/** Page for signed-in people only. */
function signedIn(page: ReactElement) {
  return <ProtectedRoute>{page}</ProtectedRoute>;
}

/** Dashboard pages: /app/<path>. */
const APP_ROUTES: { path: string; page: ReactElement }[] = [
  { path: 'live', page: <LivePage /> },
  { path: 'threats', page: <ThreatsPage /> },
  { path: 'blocked', page: <BlockedPage /> },
  { path: 'notes', page: <NotesPage /> },
  { path: 'team', page: <TeamPage /> },
  { path: 'history', page: <HistoryPage /> },
  { path: 'settings', page: <SettingsPage /> },
];

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={signedIn(<OnboardingPage />)} />
        <Route path="/app" element={signedIn(<DashboardLayout />)}>
          <Route index element={<Navigate to="live" replace />} />
          {APP_ROUTES.map(({ path, page }) => (
            <Route key={path} path={path} element={<Suspense fallback={<LoadingState />}>{page}</Suspense>} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
