import { Route } from 'react-router-dom';
import VeterinarianLayout from '../components/layout/VeterinarianLayout';
import DashboardVet from '../pages/veterinarian/DashboardVet';
import { ROUTES } from '../constants/routes';

export default function VetRoutes() {
  return (
    <Route element={<VeterinarianLayout />}>
      <Route path={ROUTES.VET.DASHBOARD} element={<DashboardVet />} />
    </Route>
  );
}