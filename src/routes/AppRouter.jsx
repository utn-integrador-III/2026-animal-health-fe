import { Navigate, Route, Routes } from 'react-router-dom';

import Login from '../pages/auth/Login';
import RegisterClient from '../pages/auth/RegisterClient';
import Unauthorized from '../pages/auth/Unauthorized';
import NotificationsPage from '../pages/NotificationsPage';
import About from '../pages/public/About';
import Services from '../pages/public/Services';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/userRoles';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import ClientRoutes from './ClientRoutes';
import VetRoutes from './VetRoutes';

export default function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.PUBLIC.ABOUT} element={<About />} />
      <Route path={ROUTES.PUBLIC.SERVICES} element={<Services />} />
      <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
      <Route path={ROUTES.AUTH.REGISTER} element={<RegisterClient />} />
      <Route path={ROUTES.AUTH.UNAUTHORIZED} element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={[USER_ROLES.CLIENT]} />}>
          {ClientRoutes()}
        </Route>

        <Route element={<RoleGuard allowedRoles={[USER_ROLES.VETERINARIAN]} />}>
          {VetRoutes()}
        </Route>

        <Route path={ROUTES.SHARED.NOTIFICATIONS} element={<NotificationsPage />} />
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.PUBLIC.ABOUT} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
    </Routes>
  );
}
