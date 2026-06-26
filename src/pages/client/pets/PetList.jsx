import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';

import AddPetModal from '../../../components/modals/AddPetModal';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import { usePetsList } from '../../../hooks/usePets';

export default function PetList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: pets = [], isLoading, isError } = usePetsList();

  if (isLoading) return <Loader label="Loading your pets..." />;

  return (
    <main className="page-container">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="page-eyebrow">DB-US-02 / FE-US-02</p>
          <h1 className="page-title">Pet Profiles</h1>
          <p className="page-subtitle">
            View your registered pets or add another pet profile.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <HiPlus />
          Register pet
        </Button>
      </header>

      {isError && (
        <p className="status-error">
          Pet profiles could not be loaded. Verify that the backend is running.
        </p>
      )}

      {!isError && pets.length === 0 && (
        <div className="empty-state">
          <span className="mb-4 text-5xl">{DEFAULT_PET_ICON}</span>
          <h2 className="empty-state-title">No pets registered</h2>
          <p className="empty-state-description">
            Register a pet to create its profile.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <HiPlus />
            Add first pet
          </Button>
        </div>
      )}

      {!isError && pets.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const breed = pet.breed_secondary
              ? `${pet.breed_primary} / ${pet.breed_secondary}`
              : pet.breed_primary;
            return (
              <article key={pet.id} className="pet-card">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50 text-3xl">
                    {SPECIES_ICON[pet.species] ?? DEFAULT_PET_ICON}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{pet.name}</h2>
                    <p className="text-sm font-medium text-teal-700">{pet.species}</p>
                    <p className="text-xs text-slate-500">{breed}</p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="info-tile">
                    <dt className="text-xs text-slate-400">Sex</dt>
                    <dd className="font-medium text-slate-700">{pet.sex}</dd>
                  </div>
                  <div className="info-tile">
                    <dt className="text-xs text-slate-400">Weight</dt>
                    <dd className="font-medium text-slate-700">{pet.weight_kg} kg</dd>
                  </div>
                  <div className="info-tile col-span-2">
                    <dt className="text-xs text-slate-400">Date of birth</dt>
                    <dd className="font-medium text-slate-700">{pet.birth_date}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}

      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </main>
  );
}
