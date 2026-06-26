import { Navigate, Route, Routes } from 'react-router-dom';

import ClientLayout from '../components/layout/ClientLayout';
import Login from '../pages/auth/Login';
import RegisterClient from '../pages/auth/RegisterClient';
import PetList from '../pages/client/pets/PetList';
import { ROUTES } from '../constants/routes';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
      <Route path={ROUTES.AUTH.REGISTER} element={<RegisterClient />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<ClientLayout />}>
          <Route path={ROUTES.CLIENT.PETS} element={<PetList />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
    </Routes>
  );
}
