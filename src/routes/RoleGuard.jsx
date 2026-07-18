import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { ROUTES } from '../constants/routes';

export default function RoleGuard({ allowedRoles }) {
  const role = useAuthStore((state) => state.role);

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.AUTH.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}