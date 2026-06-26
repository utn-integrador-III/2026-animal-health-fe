import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { ROUTES } from '../constants/routes';
import Loader from '../components/common/Loader';

/**
 * Protects routes that require authentication.
 * If no token is present, redirects to /auth/login.
 */
export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const authStatus = useAuthStore((state) => state.authStatus);

  if (authStatus === 'loading') return <Loader label="Validating session..." />;
  return token && authStatus === 'authenticated'
    ? <Outlet />
    : <Navigate to={ROUTES.AUTH.LOGIN} replace />;
}
