import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  useAllergiesList,
  useAddAllergy,
  useUpdateAllergy,
  useDeleteAllergy,
} from '../../hooks/useAllergies';
import { useAddDiagnosis, useDiagnosesList } from '../../hooks/useDiagnoses';
import VetDiagnosisForm, { INITIAL_FORM } from '../../components/veterinarian/VetDiagnosisForm';
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
  try {
    const dateObj = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
    if (isNaN(dateObj.getTime())) return value;
    return new Intl.DateTimeFormat(language, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return value;
  }
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
  const addDiagnosis = useAddDiagnosis();
  const [activeSection, setActiveSection] = useState('summary');
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [clinicalObservation, setClinicalObservation] = useState('');
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState(null);
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
  const { data: diagnosesList = [] } = useDiagnosesList(appointment?.pet_id);

  const allRecords = useMemo(() => {
    const combined = [...diagnosesList, ...clinicalRecords];
    const uniqueMap = new Map();
    combined.forEach((item) => {
      if (item && item.id) {
        uniqueMap.set(item.id, item);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => {
      const dateA = new Date(a.consultation_date || a.date || 0);
      const dateB = new Date(b.consultation_date || b.date || 0);
      return dateB - dateA;
    });
  }, [diagnosesList, clinicalRecords]);
  const addMedication = useAddMedication();
  const { data: medicationsList = [] } = useMedicationsList(appointment?.pet_id);

  const addAllergy = useAddAllergy();
  const updateAllergyMutation = useUpdateAllergy();
  const deleteAllergyMutation = useDeleteAllergy();
  const { data: allergiesList = [] } = useAllergiesList(appointment?.pet_id);

  const [allergyForm, setAllergyForm] = useState({
    allergen: '',
    category: '',
    severity: '',
    reaction: '',
    notes: '',
  });
  const [editingAllergy, setEditingAllergy] = useState(null); // null | allergy object
  const allergyFormRef = useRef(null);

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
      key: 'medical-history',
      title: language === 'es' ? 'Historial Clínico' : 'Medical History',
      value: language === 'es' ? 'Ver' : 'View',
      detail: language === 'es' ? 'Ver línea de tiempo unificada' : 'View unified timeline',
      icon: HiClipboardList,
    },
    {
      key: 'diagnostics',
      title: t('vetPatient.cards.diagnostics.title'),
      value: allRecords.length,
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
      value: allergiesList.length,
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
      setDiagnosisForm(null); // Reset draft diagnosis form on complete consultation
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
          <Link
            to={ROUTES.VET.MEDICAL_HISTORY.replace(':appointmentId', appointmentId)}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-teal-600 bg-white text-teal-700 hover:bg-teal-50 px-4 py-2 text-sm"
          >
            <HiClipboardList aria-hidden="true" />
            {language === 'es' ? 'Historial Médico' : 'Medical History'}
          </Link>
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
          if (card.key === 'vaccines' || card.key === 'medical-history') {
            const targetRoute = card.key === 'vaccines'
              ? ROUTES.VET.VACCINES.replace(':appointmentId', appointmentId)
              : ROUTES.VET.MEDICAL_HISTORY.replace(':appointmentId', appointmentId);
            return (
              <Link
                key={card.key}
                className="vet-clinical-card text-left flex flex-col items-start animate-fade-in"
                to={targetRoute}
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
          <VetDiagnosisForm
            pet={{
              id: appointment?.pet_id,
              name: appointment?.pet_name,
              species: appointment?.pet_species,
              sex: appointment?.pet_sex,
              weight: appointment?.pet_weight_kg,
            }}
            veterinarian={user}
            isPending={addDiagnosis.isPending}
            onNavigateToSection={setActiveSection}
            diagnosisForm={diagnosisForm}
            setDiagnosisForm={setDiagnosisForm}
            onSubmit={async (payload) => {
              try {
                await addDiagnosis.mutateAsync({
                  petId: appointment?.pet_id,
                  diagnosisData: payload,
                });
                Swal.fire({
                  icon: 'success',
                  title: t('diagnoses.saveSuccess'),
                  showConfirmButton: false,
                  timer: 1500,
                });
              } catch {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: t('diagnoses.saveError'),
                });
              }
            }}
          />

          {/* History List */}
          <div className="mt-8 border-t border-gray-150 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{language === 'es' ? 'Historial Médico / Diagnósticos' : 'Medical History / Diagnoses'}</h3>
            {allRecords.length > 0 ? (
              <div className="space-y-4">
                {allRecords.map((rec) => (
                  <div key={rec.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900">{formatDate(rec.consultation_date || rec.date, language)}</span>
                      <span className="text-xs text-gray-500">{rec.veterinarian_name || rec.registered_by || 'Veterinario'}</span>
                    </div>
                    <h4 className="font-bold text-teal-800">{rec.diagnosis}</h4>
                    {rec.reason && <p className="text-sm text-gray-700 mt-1"><strong>{language === 'es' ? 'Motivo:' : 'Reason:'}</strong> {rec.reason}</p>}
                    {rec.symptoms && <p className="text-sm text-gray-700 mt-1"><strong>{language === 'es' ? 'Síntomas:' : 'Symptoms:'}</strong> {rec.symptoms}</p>}
                    {rec.presumptive_diagnosis && <p className="text-sm text-gray-700 mt-1"><strong>{language === 'es' ? 'Diag. Presuntivo:' : 'Presumptive:'}</strong> {rec.presumptive_diagnosis}</p>}
                    {rec.treatment && <p className="text-sm text-gray-700 mt-1"><strong>{language === 'es' ? 'Tratamiento:' : 'Treatment:'}</strong> {rec.treatment}</p>}
                    {rec.clinical_plan && <p className="text-sm text-teal-700 mt-1"><strong>{language === 'es' ? 'Plan Clínico:' : 'Clinical Plan:'}</strong> {rec.clinical_plan}</p>}
                    {rec.owner_instructions && <p className="text-sm text-gray-700 mt-1"><strong>{language === 'es' ? 'Indicaciones:' : 'Instructions:'}</strong> {rec.owner_instructions}</p>}
                    {rec.follow_up && <p className="text-sm text-gray-700 mt-1"><strong>{language === 'es' ? 'Seguimiento:' : 'Follow-up:'}</strong> {rec.follow_up}</p>}
                    {rec.weight_kg && <p className="text-xs text-gray-500 mt-1"><strong>{language === 'es' ? 'Peso:' : 'Weight:'}</strong> {rec.weight_kg} kg</p>}
                    {(rec.notes || rec.clinical_notes) && <p className="text-xs italic text-gray-500 mt-1"><strong>{language === 'es' ? 'Notas:' : 'Notes:'}</strong> {rec.notes || rec.clinical_notes}</p>}
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
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${med.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

      {activeSection === 'allergies' && (
        <section className="vet-current-appointment" ref={allergyFormRef}>
          <h2>{t('allergies.title')}</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">{t('allergies.subtitle')}</p>

          {/* Add / Edit Form */}
          <form
            className="vet-followup-form"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!appointment?.pet_id || !allergyForm.allergen || !allergyForm.category || !allergyForm.severity) {
                setErrorMessage(t('allergies.allergenRequired'));
                return;
              }
              setMessage('');
              setErrorMessage('');
              try {
                if (editingAllergy) {
                  await updateAllergyMutation.mutateAsync({
                    petId: appointment.pet_id,
                    allergyId: editingAllergy.id,
                    allergyData: allergyForm,
                  });
                  Swal.fire({ icon: 'success', title: t('allergies.updateSuccess'), showConfirmButton: false, timer: 1500 });
                  setEditingAllergy(null);
                } else {
                  await addAllergy.mutateAsync({
                    petId: appointment.pet_id,
                    allergyData: allergyForm,
                  });
                  Swal.fire({ icon: 'success', title: t('allergies.saveSuccess'), showConfirmButton: false, timer: 1500 });
                }
                setAllergyForm({ allergen: '', category: '', severity: '', reaction: '', notes: '' });
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error, editingAllergy ? t('allergies.updateError') : t('allergies.saveError')));
              }
            }}
          >
            <label>
              {t('allergies.allergen')} *
              <input
                required
                value={allergyForm.allergen}
                onChange={(e) => setAllergyForm((f) => ({ ...f, allergen: e.target.value }))}
                placeholder={t('allergies.allergenPlaceholder')}
              />
            </label>
            <label>
              {t('allergies.category')} *
              <select
                required
                value={allergyForm.category}
                onChange={(e) => setAllergyForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">--</option>
                {['food', 'environmental', 'medication', 'other'].map((cat) => (
                  <option key={cat} value={cat}>{t(`allergies.category.${cat}`)}</option>
                ))}
              </select>
            </label>
            <label>
              {t('allergies.severity')} *
              <select
                required
                value={allergyForm.severity}
                onChange={(e) => setAllergyForm((f) => ({ ...f, severity: e.target.value }))}
              >
                <option value="">--</option>
                {['mild', 'moderate', 'severe'].map((sev) => (
                  <option key={sev} value={sev}>{t(`allergies.severity.${sev}`)}</option>
                ))}
              </select>
            </label>
            <label>
              {t('allergies.reaction')}
              <input
                value={allergyForm.reaction}
                onChange={(e) => setAllergyForm((f) => ({ ...f, reaction: e.target.value }))}
                placeholder={t('allergies.reactionPlaceholder')}
              />
            </label>
            <label className="vet-followup-wide">
              {t('allergies.notes')}
              <textarea
                value={allergyForm.notes}
                onChange={(e) => setAllergyForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder={t('allergies.notesPlaceholder')}
              />
            </label>
            <div className="vet-followup-actions">
              {editingAllergy && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setEditingAllergy(null);
                    setAllergyForm({ allergen: '', category: '', severity: '', reaction: '', notes: '' });
                  }}
                >
                  {t('allergies.cancelEdit')}
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={addAllergy.isPending || updateAllergyMutation.isPending}
              >
                {editingAllergy ? t('allergies.updateButton') : t('allergies.addButton')}
              </Button>
            </div>
          </form>

          {/* Allergies List */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {language === 'es' ? 'Alergias Registradas' : 'Registered Allergies'}
            </h3>
            {allergiesList.length > 0 ? (
              <div className="space-y-4">
                {allergiesList.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    style={{ borderLeft: '4px solid #f59e0b' }}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{allergy.allergen}</h4>
                        <p className="text-sm text-teal-700 font-medium mt-0.5">
                          {t(`allergies.category.${allergy.category?.toLowerCase()}`) || allergy.category}
                          {' • '}
                          {t(`allergies.severity.${allergy.severity?.toLowerCase()}`) || allergy.severity}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingAllergy(allergy);
                            setAllergyForm({
                              allergen: allergy.allergen ?? '',
                              category: allergy.category ?? '',
                              severity: allergy.severity ?? '',
                              reaction: allergy.reaction ?? '',
                              notes: allergy.notes ?? '',
                            });
                            allergyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                        >
                          {t('allergies.editButton')}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: t('allergies.deleteConfirmTitle'),
                              text: t('allergies.deleteConfirmText'),
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#dc2626',
                              confirmButtonText: t('allergies.deleteConfirmButton'),
                              cancelButtonText: t('allergies.cancelEdit'),
                            });
                            if (!result.isConfirmed) return;
                            try {
                              await deleteAllergyMutation.mutateAsync({
                                petId: appointment.pet_id,
                                allergyId: allergy.id,
                              });
                              Swal.fire({ icon: 'success', title: t('allergies.deleteSuccess'), showConfirmButton: false, timer: 1500 });
                            } catch (error) {
                              setErrorMessage(getApiErrorMessage(error, t('allergies.deleteError')));
                            }
                          }}
                        >
                          {t('allergies.deleteButton')}
                        </Button>
                      </div>
                    </div>
                    {allergy.reaction && (
                      <p className="text-sm text-slate-700 mt-2">
                        <strong>{t('allergies.reaction')}:</strong> {allergy.reaction}
                      </p>
                    )}
                    {allergy.notes && (
                      <p className="text-xs italic text-slate-500 mt-1">
                        <strong>{t('allergies.notes')}:</strong> {allergy.notes}
                      </p>
                    )}
                    {allergy.veterinarian_name && (
                      <p className="text-xs text-slate-400 mt-1">
                        {t('allergies.veterinarian')}: {allergy.veterinarian_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">{t('allergies.empty')}</p>
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
