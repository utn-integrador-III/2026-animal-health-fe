import { Route } from 'react-router-dom';
import ClientLayout from '../components/layout/ClientLayout';
import Dashboard from '../pages/client/Dashboard';
import HealthSection from '../pages/client/HealthSection';
import Profile from '../pages/client/Profile';
import AppointmentCalendar from '../pages/client/appointments/AppointmentCalendar';
import AllergiesPage from '../pages/client/allergies/AllergiesPage';
import PetList from '../pages/client/pets/PetList';
import PetDetails from '../pages/client/pets/PetDetails';
import EditPet from '../pages/client/pets/EditPet';
import PetMedicalHistory from '../pages/client/pets/PetMedicalHistory';
import VaccinesPage from '../pages/client/vaccines/VaccinesPage';
import MedicationsPage from '../pages/client/medications/MedicationsPage';
import MedicationReminder from '../pages/client/medications/MedicationReminder';
import DiagnosisPage from '../pages/client/diagnoses/DiagnosisPage';
import PetCareRecommendations from '../pages/client/ai/PetCareRecommendations';
import { ROUTES } from '../constants/routes';
/* <Route path={ROUTES.CLIENT.ALLERGIES} element={<AllergiesPage />} /> */
export default function ClientRoutes() {
  return (
    <Route element={<ClientLayout />}>
      <Route path={ROUTES.CLIENT.DASHBOARD} element={<Dashboard />} />
      <Route path={ROUTES.CLIENT.PROFILE} element={<Profile />} />
      <Route path={ROUTES.CLIENT.PETS} element={<PetList />} />
      <Route
        path={ROUTES.CLIENT.APPOINTMENTS}
        element={<AppointmentCalendar />}
      />
      <Route
        path={ROUTES.CLIENT.VACCINES}
        element={<VaccinesPage />}
      />
      <Route
        path={ROUTES.CLIENT.MEDICATIONS}
        element={<MedicationsPage />}
      />
      <Route
        path={ROUTES.CLIENT.MEDICATION_REMINDERS}
        element={<MedicationReminder />}
      />
      <Route
        path={ROUTES.CLIENT.DIAGNOSTICS}
        element={<DiagnosisPage />}
      />
      <Route
        path={ROUTES.CLIENT.ALLERGIES}
        element={<AllergiesPage />}
      />

      <Route
        path={ROUTES.CLIENT.LAB_RESULTS}
        element={<HealthSection title="Lab results" description="Laboratory results and follow-up information for the selected pet." />}
      />
      <Route
        path={ROUTES.CLIENT.RECOMMENDATIONS}
        element={<PetCareRecommendations />}
      />
      <Route path={ROUTES.CLIENT.PET_DETAIL} element={<PetDetails />} />
      <Route path={ROUTES.CLIENT.PET_EDIT} element={<EditPet />} />
      <Route path={ROUTES.CLIENT.PET_HISTORY} element={<PetMedicalHistory />} />
    </Route>
  );
}
