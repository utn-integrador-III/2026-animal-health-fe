import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  HiBeaker,
  HiCalendar,
  HiClipboardList,
  HiExclamation,
  HiPlus,
  HiSparkles,
  HiX,
} from 'react-icons/hi';

import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../constants/petConstants';
import { ROUTES } from '../../constants/routes';
import {
  useAppointments,
  useAvailableSlots,
  useCompleteAppointment,
  useCreateFollowUpAppointment,
} from '../../hooks/useAppointments';
import useTranslation from '../../hooks/useTranslation';
import { getApiErrorMessage } from '../../services/apiError';
import useAuthStore from '../../stores/useAuthStore';

const DURATIONS = [
  { blocks: '1', labelKey: 'appointments.duration.30.label' },
  { blocks: '2', labelKey: 'appointments.duration.60.label' },
  { blocks: '3', labelKey: 'appointments.duration.90.label' },
  { blocks: '4', labelKey: 'appointments.duration.120.label' },
];

const EMPTY_FORM = {
  appointment_date: '',
  appointment_time: '',
  duration_blocks: '1',
  reason: '',
};

function normalizeTime(value) {
  return value ? value.slice(0, 5) : '';
}

function formatDate(value, language) {
  if (!value) return '--';
  return new Intl.DateTimeFormat(language, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function calculateAge(birthDate, t) {
  if (!birthDate) return '--';
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return t('vetPatient.ageFormat')
    .replace('{years}', years)
    .replace('{months}', months)
    .replace('{days}', days);
}

function FollowUpModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  veterinarianId,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const { t } = useTranslation();
  const { data: slotData } = useAvailableSlots({
    appointmentDate: form.appointment_date,
    veterinarianId,
    durationBlocks: Number(form.duration_blocks || 1),
  });

  if (!isOpen) return null;

  const slots = slotData?.slots ?? [];
  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
      ...(field === 'appointment_date' || field === 'duration_blocks'
        ? { appointment_time: '' }
        : {}),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      pet_id: appointment.pet_id,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      duration_blocks: Number(form.duration_blocks || 1),
      reason: form.reason,
    });
  };

  return (
    <div className="vet-consultation-modal-backdrop">
      <section className="vet-consultation-modal" role="dialog" aria-modal="true" aria-label={t('vetPatient.newConsultation')}>
        <button type="button" className="vet-consultation-close" onClick={onClose}>
          <HiX aria-hidden="true" />
        </button>
        <h2>{t('vetPatient.newConsultation')}</h2>
        <p>{t('vetPatient.followUpHelp').replace('{petName}', appointment.pet_name)}</p>

        <form className="vet-followup-form" onSubmit={handleSubmit}>
          <label>
            {t('appointments.date')}
            <input
              required
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.appointment_date}
              onChange={updateField('appointment_date')}
            />
          </label>

          <label>
            {t('appointments.duration')}
            <select
              required
              value={form.duration_blocks}
              onChange={updateField('duration_blocks')}
            >
              {DURATIONS.map((duration) => (
                <option key={duration.blocks} value={duration.blocks}>
                  {t(duration.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t('appointments.time')}
            <select
              required
              value={form.appointment_time}
              onChange={updateField('appointment_time')}
            >
              <option value="">{t('appointments.selectTime')}</option>
              {slots.length === 0 && (
                <option value="" disabled>{t('appointments.noSlots')}</option>
              )}
              {slots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </label>

          <label className="vet-followup-wide">
            {t('appointments.reason')}
            <textarea
              required
              minLength={3}
              value={form.reason}
              onChange={updateField('reason')}
              placeholder={t('appointments.reasonPlaceholder')}
            />
          </label>

          <div className="vet-followup-actions">
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

function CompleteAppointmentModal({
  isOpen,
  observation,
  onClose,
  onConfirm,
  isSaving,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="vet-consultation-modal-backdrop">
      <section
        className="vet-consultation-modal vet-complete-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('vetPatient.completeWarningTitle')}
      >
        <button type="button" className="vet-consultation-close" onClick={onClose}>
          <HiX aria-hidden="true" />
        </button>
        <h2>{t('vetPatient.completeWarningTitle')}</h2>
        <p>{t('vetPatient.completeWarningText')}</p>

        <div className="vet-complete-change-list">
          <h3>{t('vetPatient.completeChangesTitle')}</h3>
          <ul>
            <li>
              <strong>{t('vetPatient.completeObservationChange')}</strong>
              <span>{observation?.trim() || t('vetPatient.noObservation')}</span>
            </li>
          </ul>
        </div>

        <div className="vet-followup-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            {t('appointments.cancel')}
          </Button>
          <Button type="button" onClick={onConfirm} isLoading={isSaving}>
            {t('vetPatient.confirmFinish')}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function VetPatientProfile() {
  const { appointmentId } = useParams();
  const { language, t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { data: appointments = [], isLoading, isError } = useAppointments({ enabled: true });
  const createFollowUp = useCreateFollowUpAppointment();
  const completeAppointment = useCompleteAppointment();
  const [activeSection, setActiveSection] = useState('summary');
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [clinicalObservation, setClinicalObservation] = useState('');
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);

  const appointment = appointments.find((item) => item.id === appointmentId);
  const petAppointments = useMemo(() => (
    appointment
      ? appointments.filter((item) => item.pet_id === appointment.pet_id)
      : []
  ), [appointment, appointments]);
  const scheduledPetAppointments = useMemo(() => (
    petAppointments.filter((item) => item.status === 'scheduled')
  ), [petAppointments]);

  useEffect(() => {
    if (appointment?.clinical_observation) {
      setClinicalObservation(appointment.clinical_observation);
    }
  }, [appointment?.clinical_observation]);

  if (isLoading) return <Loader label={t('vetPatient.loading')} />;

  if (isError || !appointment) {
    return (
      <main className="page-container">
        <p className="status-error">{t('vetPatient.loadError')}</p>
        <Link className="pet-dashboard-back" to={ROUTES.VET.DASHBOARD}>{t('vetPatient.back')}</Link>
      </main>
    );
  }

  const cards = [
    {
      key: 'appointments',
      title: t('vetPatient.cards.appointments.title'),
      value: scheduledPetAppointments.length,
      detail: t('vetPatient.cards.appointments.detail').replace('{count}', scheduledPetAppointments.length),
      icon: HiCalendar,
    },
    {
      key: 'diagnostics',
      title: t('vetPatient.cards.diagnostics.title'),
      value: 0,
      detail: t('vetPatient.cards.diagnostics.detail'),
      icon: HiClipboardList,
    },
    {
      key: 'medications',
      title: t('vetPatient.cards.medications.title'),
      value: 0,
      detail: t('vetPatient.cards.medications.detail'),
      icon: HiSparkles,
    },
    {
      key: 'allergies',
      title: t('vetPatient.cards.allergies.title'),
      value: 0,
      detail: t('vetPatient.cards.allergies.detail'),
      icon: HiExclamation,
    },
    {
      key: 'lab-results',
      title: t('vetPatient.cards.labResults.title'),
      value: 0,
      detail: t('vetPatient.cards.labResults.detail'),
      icon: HiBeaker,
    },
    {
      key: 'ai',
      title: t('vetPatient.cards.ai.title'),
      value: 0,
      detail: t('vetPatient.cards.ai.detail'),
      icon: HiSparkles,
    },
  ];

  const handleFollowUpSubmit = async (formData) => {
    setMessage('');
    setErrorMessage('');
    try {
      await createFollowUp.mutateAsync(formData);
      setIsFollowUpOpen(false);
      setActiveSection('appointments');
      setMessage(t('vetPatient.followUpSuccess'));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('vetPatient.followUpError')));
    }
  };

  const handleCompleteAppointment = async () => {
    setMessage('');
    setErrorMessage('');
    try {
      await completeAppointment.mutateAsync({
        appointmentId: appointment.id,
        clinicalObservation,
      });
      setIsCompleteConfirmOpen(false);
      setMessage(t('vetPatient.completeSuccess'));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('vetPatient.completeError')));
    }
  };

  return (
    <main className="vet-patient-profile page-container">
      <Link className="pet-dashboard-back" to={ROUTES.VET.DASHBOARD}>{t('vetPatient.back')}</Link>

      {message && <p className="status-success">{message}</p>}
      {errorMessage && <p className="status-error">{errorMessage}</p>}

      <section className="vet-patient-hero">
        {appointment.pet_photo_url ? (
          <img src={appointment.pet_photo_url} alt={appointment.pet_name} />
        ) : (
          <span>{SPECIES_ICON[appointment.pet_species] ?? DEFAULT_PET_ICON}</span>
        )}

        <dl>
          <div>
            <dt>{t('vetPatient.name')}</dt>
            <dd>{appointment.pet_name}</dd>
          </div>
          <div>
            <dt>{t('vetPatient.age')}</dt>
            <dd>{calculateAge(appointment.pet_birth_date, t)}</dd>
          </div>
          <div>
            <dt>{t('vetPatient.species')}</dt>
            <dd>{t(`petSpecies.${appointment.pet_species}`)}</dd>
          </div>
          <div>
            <dt>{t('vetPatient.sex')}</dt>
            <dd>{appointment.pet_sex ? t(`petSex.${appointment.pet_sex}`) : '--'}</dd>
          </div>
          <div>
            <dt>{t('vetPatient.breed')}</dt>
            <dd>{appointment.pet_breed ?? '--'}</dd>
          </div>
          <div>
            <dt>{t('vetPatient.weight')}</dt>
            <dd>{appointment.pet_weight_kg ? `${appointment.pet_weight_kg} kg` : '--'}</dd>
          </div>
        </dl>

        <div className="vet-patient-actions">
          <Button onClick={() => setIsFollowUpOpen(true)}>
            <HiPlus aria-hidden="true" />
            {t('vetPatient.newConsultation')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsCompleteConfirmOpen(true)}
            disabled={appointment.status !== 'scheduled'}
            isLoading={completeAppointment.isPending}
          >
            {t('vetPatient.finishAppointment')}
          </Button>
        </div>
      </section>

      <section className="vet-clinical-card-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              className="vet-clinical-card"
              onClick={() => setActiveSection(card.key)}
              aria-pressed={activeSection === card.key}
            >
              <span><Icon aria-hidden="true" /></span>
              <strong>{card.value}</strong>
              <h2>{card.title}</h2>
              <p>{card.detail}</p>
            </button>
          );
        })}
      </section>

      {activeSection === 'appointments' && (
        <section className="vet-current-appointment">
          <h2>{t('vetPatient.currentAppointmentTitle')}</h2>
          <dl>
            <div><dt>{t('vetPatient.pet')}</dt><dd>{appointment.pet_name}</dd></div>
            <div><dt>{t('vetPatient.owner')}</dt><dd>{appointment.owner_name ?? t('vetPatient.clientFallback')}</dd></div>
            <div><dt>{t('appointments.date')}</dt><dd>{formatDate(appointment.appointment_date, language)}</dd></div>
            <div><dt>{t('appointments.time')}</dt><dd>{normalizeTime(appointment.appointment_time)}</dd></div>
            <div>
              <dt>{t('appointments.duration')}</dt>
              <dd>
                {t(DURATIONS.find((duration) => (
                  Number(duration.blocks) === appointment.duration_blocks
                ))?.labelKey ?? 'appointments.duration.30.label')}
              </dd>
            </div>
            <div><dt>{t('appointments.veterinarian')}</dt><dd>{appointment.veterinarian_name ?? user?.full_name}</dd></div>
            <div className="vet-current-appointment-wide">
              <dt>{t('appointments.reason')}</dt>
              <dd>{appointment.reason}</dd>
            </div>
          </dl>
          <label className="vet-clinical-observation">
            {t('vetPatient.clinicalObservation')}
            <textarea
              value={clinicalObservation}
              onChange={(event) => setClinicalObservation(event.target.value)}
              placeholder={t('vetPatient.clinicalObservationPlaceholder')}
              disabled={appointment.status !== 'scheduled'}
            />
          </label>
        </section>
      )}

      <FollowUpModal
        appointment={appointment}
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        onSubmit={handleFollowUpSubmit}
        isSaving={createFollowUp.isPending}
        veterinarianId={user?.id}
      />
      <CompleteAppointmentModal
        isOpen={isCompleteConfirmOpen}
        observation={clinicalObservation}
        onClose={() => setIsCompleteConfirmOpen(false)}
        onConfirm={handleCompleteAppointment}
        isSaving={completeAppointment.isPending}
      />
    </main>
  );
}
