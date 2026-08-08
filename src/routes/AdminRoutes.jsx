import { Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import DashboardAdmin from '../pages/admin/Dashboard';
import Veterinarians from '../pages/admin/Veterinarians';
import VetCreate from '../pages/admin/VetCreate';
import { ROUTES } from '../constants/routes';

export default function AdminRoutes() {
  return (
    <Route element={<AdminLayout />}>
      <Route path={ROUTES.ADMIN.DASHBOARD} element={<DashboardAdmin />} />
      <Route path={ROUTES.ADMIN.VETERINARIANS} element={<Veterinarians />} />
      <Route path={ROUTES.ADMIN.VET_CREATE} element={<VetCreate />} />
    </Route>
  );
}
