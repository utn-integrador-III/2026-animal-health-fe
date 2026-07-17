import Swal from 'sweetalert2';
import Modal from '../common/Modal';
import PetForm from '../forms/PetForm';
import { useCreatePet } from '../../hooks/usePets';
import { SWAL_PRESETS } from '../../constants/swalConfig';
import { getApiErrorMessage } from '../../services/apiError';
import useTranslation from '../../hooks/useTranslation';

/**
 * AddPetModal — FE-US-02: Pet Registration
 *
 * Opens a modal dialog that lets a client register a new pet.
 * On successful submission the modal closes and the pet list
 * is automatically refreshed via React Query cache invalidation.
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen  - Controls modal visibility
 * @param {function} props.onClose - Callback to close the modal
 */
export default function AddPetModal({ isOpen, onClose }) {
  const { mutate: createPet, isPending } = useCreatePet();
  const { t } = useTranslation();

  /**
   * Handles form submission.
   * Calls the createPet mutation and shows feedback via SweetAlert2.
   * All alert styling comes from SWAL_PRESETS — no hardcoded colors.
   *
   * @param {object} formData - Validated data from PetForm (petSchema)
   */
  const handleSubmit = (formData) => {
    // Strip empty optional fields before sending to the API
    const payload = {
      name:             formData.name,
      birth_date:       formData.birth_date,
      species:          formData.species,
      sex:              formData.sex,
      breed_primary:    formData.breed_primary,
      breed_secondary:  formData.breed_secondary || null,
      mixed_breed:      formData.mixed_breed,
      weight_kg:        formData.weight_kg,
    };

    createPet(payload, {
      onSuccess: () => {
        onClose();
        Swal.fire({
          ...SWAL_PRESETS.SUCCESS,
          title: t('petForm.successTitle'),
          text: `${formData.name} ${t('petForm.successText')}`,
        });
      },
      onError: (error) => {
        const message = getApiErrorMessage(
          error,
          t('petForm.errorText'),
        );
        Swal.fire({
          ...SWAL_PRESETS.ERROR,
          title: t('petForm.errorTitle'),
          text: message,
        });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('petForm.registerTitle')}
      maxWidth="max-w-xl"
    >
      <p className="mb-5 text-sm text-gray-500">
        {t('petForm.intro')}
      </p>

      <PetForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isPending}
      />
    </Modal>
  );
}
