import { Navigate, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/features/auth/api';
import LoadingState from '@/components/layout/LoadingState';

/**
 * Route guard: renders children only for a signed-in person.
 * - session still being checked → loading line
 * - no session (401) → /login?next=<where they wanted to go>
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: user, isLoading } = useGetMeQuery();

  if (isLoading) {
    return <LoadingState>Checking your session…</LoadingState>;
  }
  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return <>{children}</>;
}
