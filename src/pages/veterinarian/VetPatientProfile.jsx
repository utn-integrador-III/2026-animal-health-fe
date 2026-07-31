import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  HiBeaker,
  HiCalendar,
  HiClipboardList,
  HiExclamation,
  HiPlus,
  HiShieldCheck,
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
import { useVaccinesList } from '../../hooks/useVaccines';
import useAuthStore from '../../stores/useAuthStore';
import {
  useClinicalRecordsList,
  useAddClinicalRecord,
  useMedicationsList,
  useAddMedication,
} from '../../hooks/useMedical';
import Swal from 'sweetalert2';

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
  const [vaccineForm, setVaccineForm] = useState({
    name: '',
    type: '',
    status: 'upcoming',
    scheduledDate: '',
    notes: '',
  });

  const appointment = appointments.find((item) => item.id === appointmentId);
  const { data: vaccinesList = [] } = useVaccinesList(appointment?.pet_id);
  const vaccinesCount = vaccinesList.length;

  const addClinicalRecord = useAddClinicalRecord();
  const { data: clinicalRecords = [] } = useClinicalRecordsList(appointment?.pet_id);
  const addMedication = useAddMedication();
  const { data: medicationsList = [] } = useMedicationsList(appointment?.pet_id);

  const [clinicalForm, setClinicalForm] = useState({
    diagnosis: '',
    treatment: '',
    weight_kg: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    administration_time: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });
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
      value: clinicalRecords.length,
      detail: t('vetPatient.cards.diagnostics.detail'),
      icon: HiClipboardList,
    },
    {
      key: 'medications',
      title: t('vetPatient.cards.medications.title'),
      value: medicationsList.length,
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
    {
      key: 'vaccines',
      title: t('vetPatient.cards.vaccines.title'),
      value: vaccinesCount,
      detail: t('vetPatient.cards.vaccines.detail'),
      icon: HiShieldCheck,
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

  const handleClinicalSubmit = async (event) => {
    event.preventDefault();
    if (!appointment?.pet_id || !clinicalForm.diagnosis || !clinicalForm.treatment) {
      setErrorMessage(t('diagnostics.diagnosisRequired'));
      return;
    }
    setMessage('');
    setErrorMessage('');
    try {
      await addClinicalRecord.mutateAsync({
        petId: appointment.pet_id,
        recordData: {
          ...clinicalForm,
          weight_kg: clinicalForm.weight_kg ? Number(clinicalForm.weight_kg) : null,
        },
      });
      Swal.fire({
        icon: 'success',
        title: t('diagnostics.saveSuccess'),
        showConfirmButton: false,
        timer: 1500,
      });
      setClinicalForm({
        diagnosis: '',
        treatment: '',
        weight_kg: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('vetPatient.completeError')));
    }
  };

  const handleMedicationSubmit = async (event) => {
    event.preventDefault();
    if (!appointment?.pet_id || !medicationForm.name || !medicationForm.dosage || !medicationForm.frequency || !medicationForm.end_date) {
      setErrorMessage(t('medications.nameRequired'));
      return;
    }
    setMessage('');
    setErrorMessage('');
    try {
      await addMedication.mutateAsync({
        petId: appointment.pet_id,
        medicationData: medicationForm,
      });
      Swal.fire({
        icon: 'success',
        title: t('medications.saveSuccess'),
        showConfirmButton: false,
        timer: 1500,
      });
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        administration_time: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      });
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
          if (card.key === 'vaccines') {
            return (
              <Link
                key={card.key}
                className="vet-clinical-card text-left flex flex-col items-start"
                to={ROUTES.VET.VACCINES.replace(':appointmentId', appointmentId)}
              >
                <span><Icon aria-hidden="true" /></span>
                <strong>{card.value}</strong>
                <h2>{card.title}</h2>
                <p>{card.detail}</p>
              </Link>
            );
          }
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

      {activeSection === 'diagnostics' && (
        <section className="vet-current-appointment">
          <h2>{t('diagnostics.title')}</h2>
          <p className="page-subtitle">{t('vetPatient.cards.diagnostics.detail')}</p>

          <form className="vet-followup-form" onSubmit={handleClinicalSubmit}>
            <label>
              {t('diagnostics.table.diagnosis')} *
              <input
                required
                value={clinicalForm.diagnosis}
                onChange={(event) => setClinicalForm((current) => ({ ...current, diagnosis: event.target.value }))}
                placeholder="ej. Gastroenteritis"
              />
            </label>
            <label>
              {t('diagnostics.table.treatment')} *
              <input
                required
                value={clinicalForm.treatment}
                onChange={(event) => setClinicalForm((current) => ({ ...current, treatment: event.target.value }))}
                placeholder="ej. Antibióticos por 7 días"
              />
            </label>
            <label>
              {t('diagnostics.table.weight')} (kg)
              <input
                type="number"
                step="0.01"
                value={clinicalForm.weight_kg}
                onChange={(event) => setClinicalForm((current) => ({ ...current, weight_kg: event.target.value }))}
                placeholder={appointment.pet_weight_kg ? `${appointment.pet_weight_kg}` : "8.5"}
              />
            </label>
            <label>
              {t('diagnostics.table.date')} *
              <input
                required
                type="date"
                value={clinicalForm.date}
                onChange={(event) => setClinicalForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label className="vet-followup-wide">
              {t('diagnostics.table.notes')}
              <textarea
                value={clinicalForm.notes}
                onChange={(event) => setClinicalForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Notas adicionales u observaciones..."
              />
            </label>
            <div className="vet-followup-actions">
              <Button type="submit" isLoading={addClinicalRecord.isPending}>
                {t('diagnostics.addRecord')}
              </Button>
            </div>
          </form>

          {/* History List */}
          <div className="mt-8 border-t border-gray-150 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{language === 'es' ? 'Historial Médico' : 'Medical History'}</h3>
            {clinicalRecords.length > 0 ? (
              <div className="space-y-4">
                {clinicalRecords.map((rec) => (
                  <div key={rec.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900">{formatDate(rec.date, language)}</span>
                      <span className="text-xs text-gray-500">{rec.veterinarian_name}</span>
                    </div>
                    <h4 className="font-bold text-teal-800">{rec.diagnosis}</h4>
                    <p className="text-sm text-gray-700 mt-1"><strong>Tratamiento:</strong> {rec.treatment}</p>
                    {rec.weight_kg && <p className="text-xs text-gray-500 mt-1"><strong>Peso:</strong> {rec.weight_kg} kg</p>}
                    {rec.notes && <p className="text-xs italic text-gray-500 mt-1"><strong>Notas:</strong> {rec.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">{t('diagnostics.emptyDescription')}</p>
            )}
          </div>
        </section>
      )}

      {activeSection === 'medications' && (
        <section className="vet-current-appointment">
          <h2>{t('medications.title')}</h2>
          <p className="page-subtitle">{t('medications.activeTreatments')}</p>

          <form className="vet-followup-form" onSubmit={handleMedicationSubmit}>
            <label>
              {t('medications.name')} *
              <input
                required
                value={medicationForm.name}
                onChange={(event) => setMedicationForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="ej. Amoxicilina"
              />
            </label>
            <label>
              {t('medications.dosage')} *
              <input
                required
                value={medicationForm.dosage}
                onChange={(event) => setMedicationForm((current) => ({ ...current, dosage: event.target.value }))}
                placeholder="ej. 1/2 tableta"
              />
            </label>
            <label>
              {t('medications.frequency')} *
              <input
                required
                value={medicationForm.frequency}
                onChange={(event) => setMedicationForm((current) => ({ ...current, frequency: event.target.value }))}
                placeholder="ej. Cada 12 horas"
              />
            </label>
            <label>
              {t('medications.administrationTime') || (language === 'es' ? 'Hora de Administración' : 'Administration Time')} *
              <input
                required
                type="time"
                value={medicationForm.administration_time}
                onChange={(event) => setMedicationForm((current) => ({ ...current, administration_time: event.target.value }))}
              />
            </label>
            <label>
              {language === 'es' ? 'Fecha Inicio' : 'Start Date'} *
              <input
                required
                type="date"
                value={medicationForm.start_date}
                onChange={(event) => setMedicationForm((current) => ({ ...current, start_date: event.target.value }))}
              />
            </label>
            <label>
              {language === 'es' ? 'Fecha Fin' : 'End Date'} *
              <input
                required
                type="date"
                value={medicationForm.end_date}
                onChange={(event) => setMedicationForm((current) => ({ ...current, end_date: event.target.value }))}
              />
            </label>
            <label className="vet-followup-wide">
              {t('medications.notes')}
              <textarea
                value={medicationForm.notes}
                onChange={(event) => setMedicationForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="ej. Dar con alimentos"
              />
            </label>
            <div className="vet-followup-actions">
              <Button type="submit" isLoading={addMedication.isPending}>
                {t('medications.addMedication')}
              </Button>
            </div>
          </form>

          {/* Prescriptions List */}
          <div className="mt-8 border-t border-gray-150 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{language === 'es' ? 'Tratamientos Recetados' : 'Prescribed Treatments'}</h3>
            {medicationsList.length > 0 ? (
              <div className="space-y-4">
                {medicationsList.map((med) => (
                  <div key={med.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{med.name}</h4>
                        <p className="text-sm text-teal-800 font-medium">{med.dosage} • {med.frequency}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        med.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {med.status === 'active' ? (language === 'es' ? 'Activo' : 'Active') : (language === 'es' ? 'Completado' : 'Completed')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span>{formatDate(med.start_date, language)} - {formatDate(med.end_date, language)}</span>
                      <span className="mx-2">•</span>
                      <span>{language === 'es' ? 'Recetado por' : 'Prescribed by'} {med.veterinarian_name}</span>
                    </div>
                    {med.notes && <p className="text-xs italic text-gray-500 mt-2 bg-gray-50 p-2 rounded">{language === 'es' ? 'Indicaciones' : 'Instructions'}: {med.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">{t('medications.noActive')}</p>
            )}
          </div>
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
