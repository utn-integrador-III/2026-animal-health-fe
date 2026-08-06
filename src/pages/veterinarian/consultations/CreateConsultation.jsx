import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../components/common/Button';
import { PET_SPECIES, PET_SEX } from '../../../constants/petConstants';
import useTranslation from '../../../hooks/useTranslation';
import {
  useCreateWalkInConsultation,
  useFindClientByEmail,
} from '../../../hooks/useConsultations';
import { getApiErrorMessage } from '../../../services/apiError';
import { ROUTES } from '../../../constants/routes';

const EMPTY_CLIENT = {
  client_id: '',
  client_name: '',
  client_email: '',
  client_phone: '',
};

const EMPTY_PET = {
  pet_id: '',
  pet_name: '',
  pet_birth_date: '',
  pet_species: '',
  pet_sex: '',
  pet_breed: '',
  pet_breed_secondary: '',
  pet_mixed_breed: false,
  pet_weight_kg: '',
};

export default function CreateConsultation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const findClient = useFindClientByEmail();
  const createConsultation = useCreateWalkInConsultation();

  const [clientForm, setClientForm] = useState(EMPTY_CLIENT);
  const [petForm, setPetForm] = useState(EMPTY_PET);
  const [knownPets, setKnownPets] = useState([]);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const updateClient = (field) => (event) => {
    setClientForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updatePet = (field) => (event) => {
    const value = event.target.value;
    setPetForm((current) => {
      if (field === 'pet_mixed_breed') {
        const checked = event.target.checked;
        return {
          ...current,
          pet_mixed_breed: checked,
          pet_breed_secondary: checked ? current.pet_breed_secondary : '',
        };
      }

      if (field !== 'pet_id') return { ...current, [field]: value };

      const selected = knownPets.find((pet) => pet.id === value);
      if (!selected) return { ...EMPTY_PET, pet_id: '' };

      return {
        pet_id: selected.id,
        pet_name: selected.name,
        pet_birth_date: selected.birth_date,
        pet_species: selected.species,
        pet_sex: selected.sex,
        pet_breed: selected.breed_primary,
        pet_breed_secondary: selected.breed_secondary ?? '',
        pet_mixed_breed: Boolean(selected.mixed_breed || selected.breed_secondary),
        pet_weight_kg: String(selected.weight_kg),
      };
    });
  };

  const handleSearchClient = async () => {
    setMessage('');
    setErrorMessage('');
    try {
      const result = await findClient.mutateAsync(clientForm.client_email);
      if (!result.client) {
        setKnownPets([]);
        setClientForm((current) => ({ ...current, client_id: '' }));
        setPetForm(EMPTY_PET);
        setMessage(t('walkIn.clientNotFound'));
        return;
      }

      setClientForm({
        client_id: result.client.id,
        client_name: result.client.full_name,
        client_email: result.client.email,
        client_phone: result.client.phone ?? '',
      });
      setKnownPets(result.pets ?? []);
      setPetForm(EMPTY_PET);
      setMessage(t('walkIn.clientFound'));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('walkIn.lookupError')));
    }
  };

  const handleCreateConsultation = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    try {
      const payload = {
        ...clientForm,
        ...petForm,
        pet_breed_primary: petForm.pet_breed,
        pet_breed_secondary: petForm.pet_mixed_breed
          ? petForm.pet_breed_secondary.trim()
          : null,
        pet_mixed_breed: petForm.pet_mixed_breed,
        pet_weight_kg: petForm.pet_weight_kg ? Number(petForm.pet_weight_kg) : null,
        reason,
        create_client_account: !clientForm.client_id,
        send_temporary_password: !clientForm.client_id,
      };
      const result = await createConsultation.mutateAsync(payload);
      const appointmentId = result.appointment_id ?? result.appointment?.id ?? result.id;

      if (!appointmentId) {
        throw new Error(t('walkIn.missingAppointmentId'));
      }

      navigate(ROUTES.VET.PATIENT.replace(':appointmentId', appointmentId), {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('walkIn.consultationError')));
    }
  };

  return (
    <main className="page-container create-consultation">
      <p className="page-eyebrow">{t('walkIn.eyebrow')}</p>
      <h1>{t('walkIn.title')}</h1>
      <p className="page-subtitle">{t('walkIn.subtitle')}</p>

      {message && <p className="status-success">{message}</p>}
      {errorMessage && <p className="status-error">{errorMessage}</p>}

      <section className="walk-in-panel">
        <div>
          <h2>{t('walkIn.clientSection')}</h2>
          <div className="walk-in-search">
            <label>
              {t('walkIn.clientEmail')} *
              <input
                required
                type="email"
                value={clientForm.client_email}
                onChange={updateClient('client_email')}
                placeholder="client@example.com"
              />
            </label>
            <Button
              type="button"
              onClick={handleSearchClient}
              isLoading={findClient.isPending}
              disabled={!clientForm.client_email}
            >
              {t('walkIn.searchClient')}
            </Button>
          </div>
        </div>

        <form className="walk-in-form" onSubmit={handleCreateConsultation}>
          <label>
            {t('walkIn.clientName')} *
            <input
              required
              value={clientForm.client_name}
              onChange={updateClient('client_name')}
            />
          </label>
          <label>
            {t('walkIn.clientPhone')}
            <input
              value={clientForm.client_phone}
              onChange={updateClient('client_phone')}
            />
          </label>

          {knownPets.length > 0 && (
            <label className="walk-in-wide">
              {t('walkIn.existingPet')}
              <select value={petForm.pet_id} onChange={updatePet('pet_id')}>
                <option value="">{t('walkIn.newPetOption')}</option>
                {knownPets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {t(`petSpecies.${pet.species}`)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            {t('petForm.name')} *
            <input required value={petForm.pet_name} onChange={updatePet('pet_name')} />
          </label>
          <label>
            {t('petForm.birthDate')} *
            <input required type="date" max={new Date().toISOString().split('T')[0]} value={petForm.pet_birth_date} onChange={updatePet('pet_birth_date')} />
          </label>
          <label>
            {t('petForm.species')} *
            <select required value={petForm.pet_species} onChange={updatePet('pet_species')}>
              <option value="">{t('petForm.selectSpecies')}</option>
              {PET_SPECIES.map((species) => (
                <option key={species.value} value={species.value}>
                  {t(`petSpecies.${species.value}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('petForm.sex')} *
            <select required value={petForm.pet_sex} onChange={updatePet('pet_sex')}>
              <option value="">{t('petForm.selectSex')}</option>
              {PET_SEX.map((sex) => (
                <option key={sex.value} value={sex.value}>
                  {t(`petSex.${sex.value}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('petForm.primaryBreed')} *
            <input required value={petForm.pet_breed} onChange={updatePet('pet_breed')} />
          </label>
          <label className="walk-in-checkbox">
            <input
              type="checkbox"
              checked={petForm.pet_mixed_breed}
              onChange={updatePet('pet_mixed_breed')}
            />
            <span>{t('petForm.mixedBreed')}</span>
          </label>
          {petForm.pet_mixed_breed && (
            <label>
              {t('petForm.secondaryBreed')} *
              <input
                required
                value={petForm.pet_breed_secondary}
                onChange={updatePet('pet_breed_secondary')}
                placeholder={t('petForm.secondaryBreedPlaceholder')}
              />
            </label>
          )}
          <label>
            {t('petForm.weight')} *
            <input required type="number" step="0.001" min="0.001" value={petForm.pet_weight_kg} onChange={updatePet('pet_weight_kg')} />
          </label>
          <label className="walk-in-wide">
            {t('appointments.reason')} *
            <textarea
              required
              minLength={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t('walkIn.reasonPlaceholder')}
            />
          </label>

          <div className="walk-in-actions">
            <Button type="submit" isLoading={createConsultation.isPending}>
              {t('walkIn.createConsultation')}
            </Button>
          </div>
        </form>
      </section>

    </main>
  );
}
