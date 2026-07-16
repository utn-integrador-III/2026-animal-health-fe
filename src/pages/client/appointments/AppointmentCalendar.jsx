import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiCalendar, HiClock, HiLocationMarker, HiPlus, HiUser } from 'react-icons/hi';

import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import { ROUTES } from '../../../constants/routes';
import {
  useAppointments,
  useAvailableSlots,
  useCancelAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useVeterinarians,
} from '../../../hooks/useAppointments';
import { usePet } from '../../../hooks/usePets';
import useTranslation from '../../../hooks/useTranslation';

const EMPTY_FORM = {
  appointment_date: '',
  appointment_time: '',
  duration_blocks: '1',
  reason: '',
  veterinarian_id: '',
};

const FALLBACK_SLOTS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

const APPOINTMENT_DURATIONS = [
  {
    blocks: '1',
    labelKey: 'appointments.duration.30.label',
    titleKey: 'appointments.duration.30.title',
    descriptionKey: 'appointments.duration.30.description',
  },
  {
    blocks: '2',
    labelKey: 'appointments.duration.60.label',
    titleKey: 'appointments.duration.60.title',
    descriptionKey: 'appointments.duration.60.description',
  },
  {
    blocks: '3',
    labelKey: 'appointments.duration.90.label',
    titleKey: 'appointments.duration.90.title',
    descriptionKey: 'appointments.duration.90.description',
  },
  {
    blocks: '4',
    labelKey: 'appointments.duration.120.label',
    titleKey: 'appointments.duration.120.title',
    descriptionKey: 'appointments.duration.120.description',
  },
];

function formatDate(value, language) {
  return new Intl.DateTimeFormat(language, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function normalizeTime(value) {
  return value ? value.slice(0, 5) : '';
}

function getPetPhotoUrl(pet, appointment) {
  return appointment?.pet_photo_url ?? pet?.photo_url ?? pet?.pet_photo_url ?? '';
}

function isSunday(value) {
  if (!value) return false;
  return new Date(`${value}T00:00:00`).getDay() === 0;
}

function getFallbackSlots(durationBlocks, appointmentDate) {
  if (isSunday(appointmentDate)) return [];
  return FALLBACK_SLOTS.filter((slot) => {
    const [hour, minute] = slot.split(':').map(Number);
    const start = hour * 60 + minute;
    return Array.from({ length: durationBlocks }).every((_, index) => {
      const totalMinutes = start + index * 30;
      const requiredSlot = `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
      return FALLBACK_SLOTS.includes(requiredSlot);
    });
  });
}

function AppointmentModal({
  appointment,
  defaultPetId,
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  veterinarians,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const { t } = useTranslation();
  const { data: slotData } = useAvailableSlots({
    appointmentDate: form.appointment_date,
    veterinarianId: form.veterinarian_id,
    durationBlocks: Number(form.duration_blocks || 1),
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormError('');
    setForm(appointment
      ? {
        appointment_date: appointment.appointment_date,
        appointment_time: normalizeTime(appointment.appointment_time),
        duration_blocks: String(appointment.duration_blocks ?? 1),
        reason: appointment.reason,
        veterinarian_id: appointment.veterinarian_id,
      }
      : EMPTY_FORM);
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const updateField = (field) => (event) => {
    setFormError('');
    setForm((current) => {
      const next = { ...current, [field]: event.target.value };
      if (field === 'appointment_date' || field === 'veterinarian_id' || field === 'duration_blocks') {
        next.appointment_time = '';
      }
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSunday(form.appointment_date)) {
      setFormError(t('appointments.sundayError'));
      return;
    }
    onSubmit({
      pet_id: defaultPetId,
      ...form,
      duration_blocks: Number(form.duration_blocks || 1),
    });
  };

  const durationBlocks = Number(form.duration_blocks || 1);
  const slots = slotData?.slots ?? getFallbackSlots(durationBlocks, form.appointment_date);
  const selectedTime = normalizeTime(form.appointment_time);
  const displayedSlots = selectedTime && !slots.includes(selectedTime)
    ? [selectedTime, ...slots]
    : slots;
  const selectedDuration = APPOINTMENT_DURATIONS.find(
    (duration) => duration.blocks === form.duration_blocks,
  ) ?? APPOINTMENT_DURATIONS[0];

  return (
    <div className="appointment-modal-backdrop">
      <section className="appointment-modal" role="dialog" aria-modal="true" aria-label="New Appointment">
        <button type="button" className="appointment-modal-close" onClick={onClose}>
          ×
        </button>
        <h2>{appointment ? t('appointments.rescheduleTitle') : t('appointments.newTitle')}</h2>
        <form onSubmit={handleSubmit} className="appointment-form">
          {formError && <p className="status-error appointment-form-wide">{formError}</p>}
          <section className="appointment-duration-guide appointment-form-wide" aria-label="Appointment duration guide">
            <h3>{t('appointments.durationGuideTitle')}</h3>
            <p>
              {t('appointments.durationGuideText')}
            </p>
            <ul>
              {APPOINTMENT_DURATIONS.map((duration) => (
                <li
                  key={duration.blocks}
                  className={duration.blocks === form.duration_blocks ? 'appointment-duration-active' : ''}
                >
                  <strong>{t(duration.labelKey)}: {t(duration.titleKey)}</strong>
                  <span>{t(duration.descriptionKey)}</span>
                </li>
              ))}
            </ul>
          </section>
          <label>
            {t('appointments.date')}
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={form.appointment_date}
              onChange={updateField('appointment_date')}
            />
          </label>
          <label>
            {t('appointments.duration')} - {t(selectedDuration.titleKey)}
            <select
              required
              value={form.duration_blocks}
              onChange={updateField('duration_blocks')}
            >
              {APPOINTMENT_DURATIONS.map((duration) => (
                <option key={duration.blocks} value={duration.blocks}>
                  {t(duration.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="appointment-form-wide">
            {t('appointments.veterinarian')}
            <select
              required
              value={form.veterinarian_id}
              onChange={updateField('veterinarian_id')}
            >
              <option value="">{t('appointments.selectVet')}</option>
              {veterinarians.map((vet) => (
                <option key={vet.id} value={vet.id}>{vet.full_name}</option>
              ))}
            </select>
          </label>
          <label>
            {t('appointments.time')}
            <select
              required
              value={selectedTime}
              onChange={updateField('appointment_time')}
            >
              <option value="">{t('appointments.selectTime')}</option>
              {displayedSlots.length === 0 && (
                <option value="" disabled>{t('appointments.noSlots')}</option>
              )}
              {displayedSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </label>
          <label className="appointment-form-wide">
            {t('appointments.reason')}
            <textarea
              required
              minLength={3}
              value={form.reason}
              onChange={updateField('reason')}
              placeholder={t('appointments.reasonPlaceholder')}
            />
          </label>
          <div className="appointment-modal-actions">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              {t('appointments.cancel')}
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {t('appointments.confirm')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function AppointmentCalendar() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const petId = searchParams.get('petId');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const { data: pet, isLoading: isPetLoading } = usePet(petId);
  const { data: appointments = [], isLoading, isError } = useAppointments({ petId });
  const { data: veterinarians = [] } = useVeterinarians();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();

  const filteredAppointments = useMemo(
    () => appointments.filter((appointment) => (
      activeTab === 'upcoming'
        ? appointment.status === 'scheduled'
        : appointment.status !== 'scheduled'
    )),
    [activeTab, appointments],
  );

  const nextAppointment = appointments
    .filter((appointment) => appointment.status === 'scheduled')
    .sort((a, b) => `${a.appointment_date}T${a.appointment_time}`.localeCompare(`${b.appointment_date}T${b.appointment_time}`))[0];

  if (isPetLoading || isLoading) return <Loader label={t('appointments.loading')} />;

  const openCreateModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const openRescheduleModal = (appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    if (editingAppointment) {
      await updateAppointment.mutateAsync({
        appointmentId: editingAppointment.id,
        appointmentData: formData,
      });
    } else {
      await createAppointment.mutateAsync(formData);
    }
    closeModal();
  };

  const isSaving = createAppointment.isPending || updateAppointment.isPending;

  return (
    <main className="appointment-page page-container">
      <header className="appointment-page-header">
        <div>
          <Link className="pet-dashboard-back" to={ROUTES.CLIENT.PETS}>
            {t('appointments.back')}
          </Link>
          <h1>{t('appointments.title')}</h1>
          <p>{t('appointments.subtitle')}</p>
        </div>
        <Button onClick={openCreateModal}>
          <HiPlus />
          {t('appointments.request')}
        </Button>
      </header>

      {!pet && (
        <section className="empty-state">
          <span className="mb-4 text-5xl">{DEFAULT_PET_ICON}</span>
          <h2 className="empty-state-title">{t('appointments.selectPetTitle')}</h2>
          <p className="empty-state-description">
            {t('appointments.selectPetDescription')}
          </p>
        </section>
      )}

      {pet && (
        <>
          <section className="appointment-pet-banner">
            <div className="appointment-pet-summary">
              {getPetPhotoUrl(pet, nextAppointment) ? (
                <img src={getPetPhotoUrl(pet, nextAppointment)} alt={pet.name} />
              ) : (
                <span>{SPECIES_ICON[pet.species] ?? DEFAULT_PET_ICON}</span>
              )}
              <div>
                <h2>{pet.name}</h2>
                <p>{t(`petSpecies.${pet.species}`)} - {t(`petSex.${pet.sex}`)}</p>
              </div>
            </div>
            {nextAppointment && (
              <div className="appointment-next">
                <span>{t('appointments.next')}</span>
                <strong>{formatDate(nextAppointment.appointment_date, language)}</strong>
                <p>{normalizeTime(nextAppointment.appointment_time)}</p>
              </div>
            )}
          </section>

          {nextAppointment && (
            <p className="appointment-reminder">
              {t('appointments.reminderPrefix')}: {pet.name} {t('appointments.reminderMiddle')} {formatDate(nextAppointment.appointment_date, language)} {t('appointments.reminderAt')} {normalizeTime(nextAppointment.appointment_time)} - {nextAppointment.reason}.
            </p>
          )}

          <div className="appointment-tabs">
            <button
              type="button"
              className={activeTab === 'upcoming' ? 'appointment-tab-active' : ''}
              onClick={() => setActiveTab('upcoming')}
            >
              {t('appointments.upcoming')} ({appointments.filter((item) => item.status === 'scheduled').length})
            </button>
            <button
              type="button"
              className={activeTab === 'history' ? 'appointment-tab-active' : ''}
              onClick={() => setActiveTab('history')}
            >
              {t('appointments.history')}
            </button>
          </div>

          {isError && (
            <p className="status-error">{t('appointments.loadError')}</p>
          )}

          {!isError && filteredAppointments.length === 0 && (
            <section className="empty-state">
              <HiCalendar className="mb-4 text-5xl text-teal-600" />
              <h2 className="empty-state-title">{t('appointments.emptyTitle')}</h2>
              <p className="empty-state-description">
                {t('appointments.emptyDescription')}
              </p>
            </section>
          )}

          {!isError && filteredAppointments.map((appointment) => (
            <article key={appointment.id} className="appointment-card">
              <div className="appointment-card-main">
                {getPetPhotoUrl(pet, appointment) ? (
                  <img
                    className="appointment-card-icon"
                    src={getPetPhotoUrl(pet, appointment)}
                    alt={appointment.pet_name}
                  />
                ) : (
                  <span className="appointment-card-icon">
                    {SPECIES_ICON[appointment.pet_species] ?? DEFAULT_PET_ICON}
                  </span>
                )}
                <div>
                  <h2>{appointment.reason}</h2>
                  <p>{appointment.pet_name} - {t(`petSpecies.${appointment.pet_species}`)}</p>
                </div>
                <span className="appointment-status">{appointment.status}</span>
              </div>
              <dl className="appointment-card-details">
                <div><HiCalendar /><dd>{formatDate(appointment.appointment_date, language)}</dd></div>
                <div><HiClock /><dd>{normalizeTime(appointment.appointment_time)}</dd></div>
                <div><HiUser /><dd>{appointment.veterinarian_name}</dd></div>
                <div><HiLocationMarker /><dd>Animal Health Veterinary Clinic</dd></div>
              </dl>
              {appointment.clinical_observation && (
                <section className="appointment-vet-observation">
                  <h3>{t('appointments.vetObservation')}</h3>
                  <p>{appointment.clinical_observation}</p>
                </section>
              )}
              {appointment.status === 'scheduled' && (
                <div className="appointment-card-actions">
                  <Button variant="secondary" onClick={() => openRescheduleModal(appointment)}>
                    {t('appointments.reschedule')}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => cancelAppointment.mutateAsync(appointment.id)}
                    isLoading={cancelAppointment.isPending}
                  >
                    {t('appointments.cancel')}
                  </Button>
                </div>
              )}
            </article>
          ))}
        </>
      )}

      <AppointmentModal
        appointment={editingAppointment}
        defaultPetId={petId}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        veterinarians={veterinarians}
      />
    </main>
  );
}
