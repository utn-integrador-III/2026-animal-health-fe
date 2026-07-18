import { Link, useParams } from 'react-router-dom';
import Loader from '../../../components/common/Loader';
import { usePet } from '../../../hooks/usePets';

export default function PetDetails() {
  const { petId } = useParams();
  const { data: pet, isLoading, isError } = usePet(petId);

  if (isLoading) return <Loader label="Loading pet..." />;
  if (isError || !pet) return <p className="status-error">Pet could not be loaded.</p>;

  return (
    <main className="page-container">
      <h1 className="page-title">{pet.name}</h1>
      <p className="page-subtitle">{pet.species} - {pet.breed_primary}</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="info-tile"><dt>Birth date</dt><dd>{pet.birth_date}</dd></div>
        <div className="info-tile"><dt>Sex</dt><dd>{pet.sex}</dd></div>
        <div className="info-tile"><dt>Weight</dt><dd>{pet.weight_kg} kg</dd></div>
      </dl>

      <Link className="mt-6 inline-block text-teal-700 font-semibold" to={`/client/pets/${pet.id}/edit`}>
        Edit pet
      </Link>
    </main>
  );
}