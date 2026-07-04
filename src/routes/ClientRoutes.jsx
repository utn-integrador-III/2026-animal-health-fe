import { Route } from 'react-router-dom';
import ClientLayout from '../components/layout/ClientLayout';
import PetList from '../pages/client/pets/PetList';
import PetDetails from '../pages/client/pets/PetDetails';
import EditPet from '../pages/client/pets/EditPet';
import PetMedicalHistory from '../pages/client/pets/PetMedicalHistory';
import { ROUTES } from '../constants/routes';

export default function ClientRoutes() {
  return (
    <Route element={<ClientLayout />}>
      <Route path={ROUTES.CLIENT.PETS} element={<PetList />} />
      <Route path={ROUTES.CLIENT.PET_DETAIL} element={<PetDetails />} />
      <Route path={ROUTES.CLIENT.PET_EDIT} element={<EditPet />} />
      <Route path={ROUTES.CLIENT.PET_HISTORY} element={<PetMedicalHistory />} />
    </Route>
  );
}