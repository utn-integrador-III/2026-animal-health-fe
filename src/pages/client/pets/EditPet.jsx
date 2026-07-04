import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../../components/common/Loader';
import PetForm from '../../../components/forms/PetForm';
import { usePet, useUpdatePet } from '../../../hooks/usePets';

export default function EditPet() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { data: pet, isLoading } = usePet(petId);
  const updatePet = useUpdatePet();

  if (isLoading) return <Loader label="Loading pet..." />;

  const handleSubmit = async (petData) => {
    await updatePet.mutateAsync({ petId, petData });
    navigate(`/client/pets/${petId}`);
  };

  return (
    <main className="page-container">
      <h1 className="page-title">Edit pet</h1>
      <PetForm
        defaultValues={pet}
        onSubmit={handleSubmit}
        isLoading={updatePet.isPending}
        onCancel={() => navigate(`/client/pets/${petId}`)}
      />
    </main>
  );
}