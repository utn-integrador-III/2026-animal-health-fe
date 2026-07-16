import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import Loader from '../../../components/common/Loader';
import PetForm from '../../../components/forms/PetForm';
import { usePet, useUpdatePet, useUploadPetPhoto } from '../../../hooks/usePets';
import useTranslation from '../../../hooks/useTranslation';
import { getApiErrorMessage } from '../../../services/apiError';

export default function EditPet() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: pet, isLoading } = usePet(petId);
  const updatePet = useUpdatePet();
  const uploadPetPhoto = useUploadPetPhoto();
  const [errorMessage, setErrorMessage] = useState('');

  if (isLoading) return <Loader label={t('petForm.loadingPet')} />;

  const handleSubmit = async (petData, photoFile) => {
    setErrorMessage('');
    try {
      await updatePet.mutateAsync({ petId, petData });
      if (photoFile) {
        await uploadPetPhoto.mutateAsync({ petId, photo: photoFile });
      }
      navigate(`/client/pets/${petId}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('petForm.updateError')));
    }
  };

  return (
    <main className="page-container">
      <h1 className="page-title">{t('petForm.editTitle')}</h1>
      {errorMessage && <p className="status-error">{errorMessage}</p>}
      <PetForm
        defaultValues={pet}
        onSubmit={handleSubmit}
        isLoading={updatePet.isPending || uploadPetPhoto.isPending}
        onCancel={() => navigate(`/client/pets/${petId}`)}
        showPhotoUpload
      />
    </main>
  );
}
