import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/common/Loader';
import PetForm from '../../../components/forms/PetForm';
import { DEFAULT_PET_ICON, PET_SEX, PET_SPECIES, SPECIES_ICON } from '../../../constants/petConstants';
import { usePet, useUpdatePet, useUploadPetPhoto } from '../../../hooks/usePets';
import useTranslation from '../../../hooks/useTranslation';
import { getApiErrorMessage } from '../../../services/apiError';

function formatDisplayDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function PetDetails() {
  const { petId } = useParams();
  const { t } = useTranslation();
  const { data: pet, isLoading, isError } = usePet(petId);
  const updatePet = useUpdatePet();
  const uploadPetPhoto = useUploadPetPhoto();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (isLoading) return <Loader label={t('petForm.loadingPet')} />;
  if (isError || !pet) return <p className="status-error">{t('petForm.loadError')}</p>;

  const speciesOptions = PET_SPECIES.map(({ value }) => ({
    value,
    label: t(`petSpecies.${value}`),
  }));
  const sexOptions = PET_SEX.map(({ value }) => ({
    value,
    label: t(`petSex.${value}`),
  }));
  const petIcon = SPECIES_ICON[pet.species] ?? DEFAULT_PET_ICON;
  const isSaving = updatePet.isPending || uploadPetPhoto.isPending;

  const handleSubmit = async (petData, photoFile) => {
    setErrorMessage('');
    try {
      await updatePet.mutateAsync({ petId, petData });
      if (photoFile) {
        await uploadPetPhoto.mutateAsync({ petId, photo: photoFile });
      }
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('petForm.updateError')));
    }
  };

  return (
    <main className="page-container pet-profile-page">
      <h1 className="page-title">
        {isEditing ? t('petForm.editTitle') : t('petForm.detailTitle')}
      </h1>

      {errorMessage && <p className="status-error">{errorMessage}</p>}

      {isEditing ? (
        <PetForm
          defaultValues={pet}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          onCancel={() => {
            setErrorMessage('');
            setIsEditing(false);
          }}
          showPhotoUpload
        />
      ) : (
        <section className="pet-readonly-panel" aria-label={pet.name}>
          <div className="pet-readonly-grid">
            <label>
              {t('petForm.name')} <span>*</span>
              <input className="form-control" value={pet.name} readOnly />
            </label>

            <label>
              {t('petForm.birthDate')} <span>*</span>
              <input className="form-control" value={formatDisplayDate(pet.birth_date)} readOnly />
            </label>

            <label>
              {t('petForm.species')} <span>*</span>
              <select className="form-control" value={pet.species} disabled>
                {speciesOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              {t('petForm.sex')} <span>*</span>
              <select className="form-control" value={pet.sex} disabled>
                {sexOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              {t('petForm.primaryBreed')} <span>*</span>
              <input className="form-control" value={pet.breed_primary} readOnly />
            </label>

            <label>
              {t('petForm.weight')} <span>*</span>
              <input className="form-control" value={pet.weight_kg} readOnly />
            </label>
          </div>

          <label className="pet-readonly-checkbox">
            <input type="checkbox" checked={Boolean(pet.mixed_breed)} readOnly />
            <span>{t('petForm.mixedBreed')}</span>
          </label>

          {pet.mixed_breed && (
            <label className="pet-readonly-wide">
              {t('petForm.secondaryBreed')} <span>*</span>
              <input className="form-control" value={pet.breed_secondary ?? ''} readOnly />
            </label>
          )}

          <div className="pet-readonly-photo">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} />
            ) : (
              <span>{petIcon}</span>
            )}
          </div>

          <button
            type="button"
            className="pet-readonly-edit-link"
            onClick={() => setIsEditing(true)}
          >
            {t('petForm.editLink')}
          </button>
        </section>
      )}
    </main>
  );
}