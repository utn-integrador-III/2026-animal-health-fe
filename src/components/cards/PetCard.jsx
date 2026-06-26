import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../constants/petConstants';
import Button from '../common/Button';

function getPetAge(birthDate) {
  if (!birthDate) return 'Unknown age';
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12
    + today.getMonth() - birth.getMonth();

  if (months < 12) return `${Math.max(months, 1)} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

export default function PetCard({
  pet,
  onView,
  onEdit,
  onDelete,
  isDeleting = false,
  readOnly = false,
}) {
  const icon = SPECIES_ICON[pet.species] ?? DEFAULT_PET_ICON;
  const breed = pet.breed_secondary
    ? `${pet.breed_primary} / ${pet.breed_secondary}`
    : pet.breed_primary;

  return (
    <article className="pet-card">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50 text-3xl">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-bold text-slate-800">{pet.name}</h2>
          <p className="text-sm font-medium text-teal-600">{pet.species}</p>
          <p className="truncate text-xs text-slate-500">{breed}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">
          {getPetAge(pet.birth_date)}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          {pet.sex}
        </span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
          {pet.weight_kg} kg
        </span>
      </div>

      {!readOnly && (
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <Button variant="ghost" size="sm" onClick={onView}>
            <HiOutlineEye /> View
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <HiOutlinePencil /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-red-500 hover:bg-red-50 focus:ring-red-500"
            onClick={onDelete}
          >
            <HiOutlineTrash /> Remove
          </Button>
        </div>
      )}
    </article>
  );
}
