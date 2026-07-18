import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { petSchema } from '../../validations/petSchema';
import { PET_SPECIES, PET_SEX, PET_WEIGHT } from '../../constants/petConstants';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

/**
 * Reusable form for creating or editing a pet.
 * Uses React Hook Form + Zod validation.
 * All option lists are imported from petConstants.
 *
 * @param {object}   props
 * @param {function} props.onSubmit        - Called with validated form data
 * @param {boolean}  [props.isLoading]     - Disables submit while mutating
 * @param {object}   [props.defaultValues] - Pre-fill values for edit mode
 */
export default function PetForm({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues = {},
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      birth_date: '',
      species: '',
      sex: '',
      breed_primary: '',
      breed_secondary: '',
      mixed_breed: false,
      weight_kg: '',
      ...defaultValues,
    },
  });

  const isMixedBreed = useWatch({ control, name: 'mixed_breed' });

  return (
    <form
      id="pet-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* ── Row 1: Name + Birth Date ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="pet-name"
          label="Pet Name"
          required
          type="text"
          placeholder="e.g. Buddy"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="pet-birth-date"
          label="Date of Birth"
          required
          type="date"
          max={new Date().toISOString().split('T')[0]}
          error={errors.birth_date?.message}
          {...register('birth_date')}
        />
      </div>

      {/* ── Row 2: Species + Sex ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="pet-species"
          label="Species"
          required
          placeholder="Select species"
          options={PET_SPECIES}
          error={errors.species?.message}
          {...register('species')}
        />

        <Select
          id="pet-sex"
          label="Sex"
          required
          placeholder="Select sex"
          options={PET_SEX}
          error={errors.sex?.message}
          {...register('sex')}
        />
      </div>

      {/* ── Row 3: Primary Breed + Weight ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="pet-breed-primary"
          label="Primary Breed"
          required
          type="text"
          placeholder="e.g. Golden Retriever"
          error={errors.breed_primary?.message}
          {...register('breed_primary')}
        />

        <Input
          id="pet-weight"
          label="Weight (kg)"
          required
          type="number"
          step={PET_WEIGHT.STEP}
          min={PET_WEIGHT.MIN}
          max={PET_WEIGHT.MAX}
          placeholder="e.g. 8.5"
          error={errors.weight_kg?.message}
          {...register('weight_kg')}
        />
      </div>

      {/* ── Mixed Breed Toggle ── */}
      <div className="flex items-center gap-3">
        <input
          id="pet-mixed-breed"
          type="checkbox"
          {...register('mixed_breed')}
          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <label
          htmlFor="pet-mixed-breed"
          className="text-sm font-medium text-gray-700 select-none cursor-pointer"
        >
          Mixed breed (has a secondary breed)
        </label>
      </div>

      {/* ── Secondary Breed (conditional) ── */}
      {isMixedBreed && (
        <Input
          id="pet-breed-secondary"
          label="Secondary Breed"
          required
          type="text"
          placeholder="e.g. Labrador"
          error={errors.breed_secondary?.message}
          {...register('breed_secondary')}
        />
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          id="pet-form-submit"
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="flex-1"
        >
          Save Pet
        </Button>
      </div>
    </form>
  );
}
