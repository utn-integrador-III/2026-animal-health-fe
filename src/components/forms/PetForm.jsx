import { useEffect, useMemo, useState } from 'react';
import { HiCamera } from 'react-icons/hi';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { petSchema } from '../../validations/petSchema';
import { PET_SPECIES, PET_SEX, PET_WEIGHT } from '../../constants/petConstants';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import useTranslation from '../../hooks/useTranslation';

const PET_ERROR_TRANSLATIONS = {
  'Pet name is required': 'validation.petNameRequired',
  'Pet name must be at least 2 characters': 'validation.petNameMin',
  'Date of birth is required': 'validation.birthDateRequired',
  'Date of birth is invalid': 'validation.birthDateInvalid',
  'Date of birth cannot be in the future': 'validation.birthDateFuture',
  'Species is required': 'validation.speciesRequired',
  'Species is not supported': 'validation.speciesUnsupported',
  'Sex is required': 'validation.sexRequired',
  'Sex is not supported': 'validation.sexUnsupported',
  'Primary breed is required': 'validation.primaryBreedRequired',
  'Secondary breed is required for mixed breed pets': 'validation.secondaryBreedRequired',
  'Secondary breed is required for a mixed-breed pet': 'validation.secondaryBreedRequired',
  'Weight is required': 'validation.weightRequired',
  'Weight must be greater than 0': 'validation.weightPositive',
  'Weight must be 999 kg or less': 'validation.weightMax',
};

const EMPTY_DEFAULT_VALUES = {};

export default function PetForm({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues = EMPTY_DEFAULT_VALUES,
  showPhotoUpload = false,
}) {
  const { t } = useTranslation();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(defaultValues.photo_url ?? '');
  const [formError, setFormError] = useState('');
  const sanitizedDefaultValues = useMemo(() => ({
    name: '',
    birth_date: '',
    species: '',
    sex: '',
    breed_primary: '',
    breed_secondary: '',
    mixed_breed: false,
    weight_kg: '',
    ...defaultValues,
    breed_secondary: defaultValues.breed_secondary ?? '',
    mixed_breed: Boolean(defaultValues.mixed_breed),
    weight_kg: defaultValues.weight_kg ?? '',
  }), [defaultValues]);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: sanitizedDefaultValues,
  });

  const isMixedBreed = useWatch({ control, name: 'mixed_breed' });
  const speciesOptions = PET_SPECIES.map(({ value }) => ({
    value,
    label: t(`petSpecies.${value}`),
  }));
  const sexOptions = PET_SEX.map(({ value }) => ({
    value,
    label: t(`petSex.${value}`),
  }));
  const fieldError = (message) => {
    if (!message) return undefined;
    const translationKey = PET_ERROR_TRANSLATIONS[message];
    return translationKey ? t(translationKey) : message;
  };

  useEffect(() => {
    reset(sanitizedDefaultValues);
  }, [reset, sanitizedDefaultValues]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(defaultValues.photo_url ?? '');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile, defaultValues.photo_url]);

  const handlePhotoChange = (event) => {
    const [file] = event.target.files ?? [];
    setPhotoFile(file ?? null);
  };

  const submitForm = (formData) => {
    setFormError('');
    onSubmit({
      ...formData,
      breed_secondary: formData.mixed_breed
        ? formData.breed_secondary?.trim()
        : null,
    }, photoFile);
  };

  const handleInvalidSubmit = () => {
    setFormError(t('petForm.validationSummary'));
  };

  return (
    <form
      id="pet-form"
      onSubmit={handleSubmit(submitForm, handleInvalidSubmit)}
      className="pet-edit-form"
      noValidate
    >
      {formError && <p className="status-error">{formError}</p>}
      <div className="pet-edit-grid">
        <Input
          id="pet-name"
          label={t('petForm.name')}
          required
          type="text"
          placeholder={t('petForm.namePlaceholder')}
          error={fieldError(errors.name?.message)}
          {...register('name')}
        />

        <Input
          id="pet-birth-date"
          label={t('petForm.birthDate')}
          required
          type="date"
          max={new Date().toISOString().split('T')[0]}
          error={fieldError(errors.birth_date?.message)}
          {...register('birth_date')}
        />

        <Select
          id="pet-species"
          label={t('petForm.species')}
          required
          placeholder={t('petForm.selectSpecies')}
          options={speciesOptions}
          error={fieldError(errors.species?.message)}
          {...register('species')}
        />

        <Select
          id="pet-sex"
          label={t('petForm.sex')}
          required
          placeholder={t('petForm.selectSex')}
          options={sexOptions}
          error={fieldError(errors.sex?.message)}
          {...register('sex')}
        />

        <Input
          id="pet-breed-primary"
          label={t('petForm.primaryBreed')}
          required
          type="text"
          placeholder={t('petForm.primaryBreedPlaceholder')}
          error={fieldError(errors.breed_primary?.message)}
          {...register('breed_primary')}
        />

        <Input
          id="pet-weight"
          label={t('petForm.weight')}
          required
          type="number"
          step={PET_WEIGHT.STEP}
          min={PET_WEIGHT.MIN}
          max={PET_WEIGHT.MAX}
          placeholder={t('petForm.weightPlaceholder')}
          error={fieldError(errors.weight_kg?.message)}
          {...register('weight_kg')}
        />
      </div>

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
          {t('petForm.mixedBreed')}
        </label>
      </div>

      {isMixedBreed && (
        <Input
          id="pet-breed-secondary"
          label={t('petForm.secondaryBreed')}
          required
          type="text"
          placeholder={t('petForm.secondaryBreedPlaceholder')}
          error={fieldError(errors.breed_secondary?.message)}
          {...register('breed_secondary')}
        />
      )}

      {showPhotoUpload && (
        <section className="pet-photo-upload" aria-label={t('petForm.uploadAria')}>
          <div className="pet-photo-preview">
            {photoPreview ? (
              <img src={photoPreview} alt={t('petForm.previewAlt')} />
            ) : (
              <span aria-hidden="true">🐾</span>
            )}
            <label htmlFor="pet-photo" className="pet-photo-camera">
              <HiCamera aria-hidden="true" />
              <span className="sr-only">{t('petForm.uploadSr')}</span>
            </label>
            <input
              id="pet-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </div>
          <p>{t('petForm.uploadImage')}</p>
        </section>
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
            {t('petForm.cancel')}
          </Button>
        )}
        <Button
          id="pet-form-submit"
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="flex-1"
        >
          {t('petForm.save')}
        </Button>
      </div>
    </form>
  );
}
