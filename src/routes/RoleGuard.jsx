import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { ROUTES } from '../constants/routes';
import Loader from '../components/common/Loader';

/**
 * Guards routes by user role.
 * @param {string} allowedRole - 'client' | 'veterinarian'
 */
export default function RoleGuard({ allowedRole }) {
  const role = useAuthStore((s) => s.role);
  const authStatus = useAuthStore((s) => s.authStatus);
  if (authStatus === 'loading') return <Loader label="Loading account..." />;
  if (!role) return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  if (role !== allowedRole) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
