import { Route } from 'react-router-dom';
import VeterinarianLayout from '../components/layout/VeterinarianLayout';
import DashboardVet from '../pages/veterinarian/DashboardVet';
import VetPatientProfile from '../pages/veterinarian/VetPatientProfile';
import VetVaccines from '../pages/veterinarian/VetVaccines';
import VetMedicalHistory from '../pages/veterinarian/VetMedicalHistory';
import CreateConsultation from '../pages/veterinarian/consultations/CreateConsultation';
import ClinicalReports from '../pages/veterinarian/reports/ClinicalReports';
import { ROUTES } from '../constants/routes';

export default function VetRoutes() {
  return (
    <Route element={<VeterinarianLayout />}>
      <Route path={ROUTES.VET.DASHBOARD} element={<DashboardVet />} />
      <Route path={ROUTES.VET.PATIENT} element={<VetPatientProfile />} />
      <Route path={ROUTES.VET.VACCINES} element={<VetVaccines />} />
      <Route path={ROUTES.VET.MEDICAL_HISTORY} element={<VetMedicalHistory />} />
      <Route path={ROUTES.VET.CONSULTATION} element={<CreateConsultation />} />
      <Route path={ROUTES.VET.REPORTS} element={<ClinicalReports />} />
    </Route>
  );
}
