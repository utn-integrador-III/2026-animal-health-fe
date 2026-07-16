import { Link, useParams } from 'react-router-dom';
import Loader from '../../../components/common/Loader';
import { usePet } from '../../../hooks/usePets';
import useTranslation from '../../../hooks/useTranslation';

export default function PetDetails() {
  const { petId } = useParams();
  const { t } = useTranslation();
  const { data: pet, isLoading, isError } = usePet(petId);

  if (isLoading) return <Loader label={t('petForm.loadingPet')} />;
  if (isError || !pet) return <p className="status-error">{t('petForm.loadError')}</p>;

  return (
    <main className="page-container">
      <h1 className="page-title">{pet.name}</h1>
      <p className="page-subtitle">
        {t(`petSpecies.${pet.species}`)} - {pet.breed_primary}
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="info-tile"><dt>{t('pets.birthDate')}</dt><dd>{pet.birth_date}</dd></div>
        <div className="info-tile"><dt>{t('petForm.sex')}</dt><dd>{t(`petSex.${pet.sex}`)}</dd></div>
        <div className="info-tile"><dt>{t('pets.weight')}</dt><dd>{pet.weight_kg} kg</dd></div>
      </dl>

      <Link className="mt-6 inline-block text-teal-700 font-semibold" to={`/client/pets/${pet.id}/edit`}>
        {t('petForm.editLink')}
      </Link>
    </main>
  );
}
