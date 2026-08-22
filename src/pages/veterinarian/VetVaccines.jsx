import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiShieldCheck,
  HiCalendar,
  HiScale,
  HiUser,
  HiClipboardList,
  HiUpload,
  HiCheck,
  HiX,
  HiPlus,
  HiArrowLeft,
  HiDocumentText,
  HiPaperClip
} from 'react-icons/hi';

import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { ROUTES } from '../../constants/routes';
import { useAppointments } from '../../hooks/useAppointments';
import { usePet, useUpdatePet } from '../../hooks/usePets';
import useTranslation from '../../hooks/useTranslation';
import useAuthStore from '../../stores/useAuthStore';
import { useVaccinesList, useAddVaccine } from '../../hooks/useVaccines';
import { getApiErrorMessage } from '../../services/apiError';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../constants/petConstants';

// Vaccine recommendations based on species
const VACCINE_SUGGESTIONS = {
  Dog: [
    { name: 'Rabia', disease: 'Rabia (Lyssavirus)', manufacturer: 'Merial', dose: '1', unit: 'dosis' },
    { name: 'Parvovirus', disease: 'Parvovirosis Canina', manufacturer: 'Nobivac', dose: '1', unit: 'ml' },
    { name: 'Moquillo', disease: 'Distémper Canino', manufacturer: 'Zoetis', dose: '1', unit: 'ml' },
    { name: 'Quíntuple (Polivalente)', disease: 'Parvovirus, Moquillo, Hepatitis, Leptospirosis, Parainfluenza', manufacturer: 'Zoetis', dose: '1', unit: 'dosis' },
    { name: 'Sextuple', disease: 'Parvovirus, Moquillo, Hepatitis, Leptospirosis (2 cepas), Parainfluenza', manufacturer: 'Merial', dose: '1', unit: 'dosis' },
    { name: 'Bronchicine (Tos de las perreras)', disease: 'Bordetella bronchiseptica', manufacturer: 'Boehringer Ingelheim', dose: '1', unit: 'ml' },
  ],
  Cat: [
    { name: 'Rabia', disease: 'Rabia', manufacturer: 'Merial', dose: '1', unit: 'dosis' },
    { name: 'Triple Felina', disease: 'Calicivirus, Rinotraqueitis viral felina, Panleucopenia', manufacturer: 'Nobivac', dose: '1', unit: 'ml' },
    { name: 'Leucemia Felina', disease: 'Leucemia Felina (ViLeF)', manufacturer: 'Zoetis', dose: '1', unit: 'ml' },
    { name: 'Cuádruple Felina', disease: 'Calicivirus, Rinotraqueitis, Panleucopenia, Chlamydia psittaci', manufacturer: 'Merial', dose: '1', unit: 'dosis' },
  ],
  Default: [
    { name: 'Rabia', disease: 'Rabia', manufacturer: 'Merial', dose: '1', unit: 'dosis' },
    { name: 'Polivalente', disease: 'Infecciones comunes', manufacturer: 'Genérico', dose: '1', unit: 'dosis' },
  ],
};

const localT = {
  en: {
    title: 'Vaccine Management',
    petInfo: 'Pet Information (Read-only)',
    weight: 'Current Weight (kg)',
    weightHelp: 'Optional, updates medical record',
    weightSaved: 'Weight updated successfully in record!',
    weightError: 'Failed to update pet weight',
    saveWeight: 'Save Weight',
    owner: 'Owner',
    fileNumber: 'File Number',
    history: 'Vaccination History',
    noHistory: 'No vaccines recorded yet.',
    applyBtn: 'Apply Vaccine',
    formTitle: 'Apply New Vaccine',
    vaccineLabel: 'Vaccine Selection',
    customVaccineLabel: 'Custom Vaccine Name',
    diseaseLabel: 'Disease it prevents',
    brandLabel: 'Brand/Manufacturer',
    batchLabel: 'Batch Number',
    appDateLabel: 'Application Date',
    expDateLabel: 'Expiration Date (Optional)',
    nextDoseLabel: 'Next Dose / Booster (Optional)',
    routeLabel: 'Route of Administration',
    doseLabel: 'Applied Dose',
    unitLabel: 'Unit',
    vetLabel: 'Responsible Veterinarian',
    statusLabel: 'Vaccine Status',
    obsLabel: 'Clinical Observations',
    obsPlaceholder: 'Write observations (patient reaction, recommendations, contraindications, indications for owner...)',
    attachmentsLabel: 'Attachments (Optional)',
    uploadCard: 'Vaccination Card Photo',
    uploadCert: 'Vaccination Certificate',
    uploadPdf: 'PDF Document',
    saveBtn: 'Save Vaccine',
    cancelBtn: 'Cancel',
    clearBtn: 'Clear Form',
    successMsg: 'Vaccine recorded successfully!',
    errorMsg: 'Please fill in all required fields.',
    routeSubcutanea: 'Subcutaneous',
    routeIntramuscular: 'Intramuscular',
    routeIntranasal: 'Intranasal',
    routeOral: 'Oral',
    statusApplied: 'Applied correctly',
    statusPending: 'Booster pending',
    statusComplete: 'Complete scheme',
    statusSuspended: 'Suspended',
    customOption: 'Other (write manually)',
    selectVaccinePlaceholder: 'Select a vaccine suggestion...',
  },
  es: {
    title: 'Gestión de Vacunas',
    petInfo: 'Información de la Mascota (Solo lectura)',
    weight: 'Peso actual (kg)',
    weightHelp: 'Opcional, actualiza el expediente',
    weightSaved: '¡Peso actualizado en el expediente correctamente!',
    weightError: 'No se pudo actualizar el peso de la mascota',
    saveWeight: 'Guardar Peso',
    owner: 'Propietario',
    fileNumber: 'Número de Expediente',
    history: 'Historial de Vacunación',
    noHistory: 'No hay vacunas registradas aún.',
    applyBtn: 'Aplicar Vacuna',
    formTitle: 'Registrar Aplicación de Vacuna',
    vaccineLabel: 'Selección de Vacuna',
    customVaccineLabel: 'Nombre de Vacuna Personalizado',
    diseaseLabel: 'Enfermedad que previene',
    brandLabel: 'Marca/Fabricante',
    batchLabel: 'Número de lote',
    appDateLabel: 'Fecha de aplicación',
    expDateLabel: 'Fecha de vencimiento (Opcional)',
    nextDoseLabel: 'Próxima dosis o refuerzo (Opcional)',
    routeLabel: 'Vía de administración',
    doseLabel: 'Dosis aplicada',
    unitLabel: 'Unidad',
    vetLabel: 'Veterinario responsable',
    statusLabel: 'Estado de la vacuna',
    obsLabel: 'Observaciones clínicas',
    obsPlaceholder: 'Escribe observaciones (reacción del paciente, recomendaciones posteriores, contraindicaciones, indicaciones para el propietario...)',
    attachmentsLabel: 'Adjuntos (Opcional)',
    uploadCard: 'Fotografía del carnet de vacunación',
    uploadCert: 'Certificado de vacunación',
    uploadPdf: 'Documento PDF',
    saveBtn: 'Guardar Vacuna',
    cancelBtn: 'Cancelar',
    clearBtn: 'Limpiar formulario',
    successMsg: 'Vacuna guardada correctamente.',
    errorMsg: 'Por favor complete todos los campos obligatorios.',
    routeSubcutanea: 'Subcutánea',
    routeIntramuscular: 'Intramuscular',
    routeIntranasal: 'Intranasal',
    routeOral: 'Oral',
    statusApplied: 'Aplicada correctamente',
    statusPending: 'Refuerzo pendiente',
    statusComplete: 'Esquema completo',
    statusSuspended: 'Suspendida',
    customOption: 'Otro (escribir manualmente)',
    selectVaccinePlaceholder: 'Selecciona una sugerencia de vacuna...',
  }
};

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

function formatDate(value, language) {
  if (!value) return '--';
  return new Intl.DateTimeFormat(language, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

const EMPTY_VACCINE_FORM = {
  vaccineSelection: '', // for dropdown
  customVaccineName: '', // if custom option is selected
  disease: '',
  brand: '',
  batchNumber: '',
  applicationDate: new Date().toISOString().split('T')[0],
  expirationDate: '',
  nextDose: '',
  administrationRoute: 'Subcutánea',
  dose: '1',
  unit: 'dosis',
  status: 'Aplicada correctamente',
  observations: '',
};

export default function VetVaccines() {
  const { appointmentId } = useParams();
  const { language, t } = useTranslation();
  const activeLang = localT[language] ? language : 'es';
  const text = localT[activeLang];

  const user = useAuthStore((state) => state.user);
  const { data: appointments = [], isLoading: isAppointmentsLoading } = useAppointments({ enabled: true });

  const appointment = useMemo(() => (
    appointments.find((item) => item.id === appointmentId)
  ), [appointments, appointmentId]);

  const { data: pet, isLoading: isPetLoading } = usePet(appointment?.pet_id);
  const updatePetMutation = useUpdatePet();

  // Vaccine list from backend (React Query)
  const {
    data: vaccinesList = [],
    isLoading: isVaccinesLoading,
  } = useVaccinesList(appointment?.pet_id);
  const addVaccineMutation = useAddVaccine();

  // Local UI states
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_VACCINE_FORM);
  const [weight, setWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [weightMessage, setWeightMessage] = useState({ text: '', type: '' });

  // Mock attachments (file upload UI only — storage not yet wired)
  const [attachments, setAttachments] = useState({
    carnet: null,
    cert: null,
    pdf: null
  });

  // Synchronize weight field from loaded pet data
  useEffect(() => {
    if (pet?.weight_kg !== undefined) {
      setWeight(pet.weight_kg.toString());
    } else if (appointment?.pet_weight_kg !== undefined) {
      setWeight(appointment.pet_weight_kg.toString());
    }
  }, [pet, appointment]);

  const species = pet?.species || appointment?.pet_species || 'Dog';
  const suggestions = useMemo(() => {
    return VACCINE_SUGGESTIONS[species] || VACCINE_SUGGESTIONS.Default;
  }, [species]);

  if (isAppointmentsLoading || isPetLoading || isVaccinesLoading) {
    return <Loader label={t('vetPatient.loading')} />;
  }

  if (!appointment) {
    return (
      <main className="page-container">
        <p className="status-error">{t('vetPatient.loadError')}</p>
        <Link className="pet-dashboard-back" to={ROUTES.VET.DASHBOARD}>{t('vetPatient.back')}</Link>
      </main>
    );
  }

  // Handle Weight Update
  const handleWeightSave = async () => {
    if (!weight) return;
    setSavingWeight(true);
    setWeightMessage({ text: '', type: '' });
    try {
      // Use useUpdatePet to persist weight change
      await updatePetMutation.mutateAsync({
        petId: appointment.pet_id,
        petData: {
          ...pet,
          weight_kg: Number(weight)
        }
      });
      setWeightMessage({ text: text.weightSaved, type: 'success' });
    } catch (err) {
      console.error(err);
      setWeightMessage({ text: text.weightError, type: 'error' });
    } finally {
      setSavingWeight(false);
    }
  };

  // Form Updates
  const handleFieldChange = (field) => (e) => {
    const val = e.target.value;
    setForm((current) => {
      const next = { ...current, [field]: val };

      // Autocomplete if vaccineSelection changed
      if (field === 'vaccineSelection') {
        if (val === 'custom') {
          next.customVaccineName = '';
          next.disease = '';
          next.brand = '';
          next.dose = '1';
          next.unit = 'dosis';
        } else {
          const matched = suggestions.find((s) => s.name === val);
          if (matched) {
            next.customVaccineName = matched.name;
            next.disease = matched.disease;
            next.brand = matched.manufacturer;
            next.dose = matched.dose;
            next.unit = matched.unit;
          }
        }
      }
      return next;
    });
  };

  // Simulate File Selection
  const handleFileChange = (key) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachments(current => ({
        ...current,
        [key]: {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type
        }
      }));
    }
  };

  // Clear file attachment
  const clearFile = (key) => {
    setAttachments(current => ({
      ...current,
      [key]: null
    }));
  };

  // Save Vaccine record — persists to Firebase via the backend API
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const vaccineName = form.vaccineSelection === 'custom' ? form.customVaccineName : form.vaccineSelection;

    if (!vaccineName || !form.disease || !form.applicationDate || !form.brand) {
      setErrorMessage(text.errorMsg);
      return;
    }

    // Build the payload matching VaccineCreate schema (snake_case keys)
    const vaccinePayload = {
      name: vaccineName,
      type: form.disease,
      brand: form.brand,
      batch_number: form.batchNumber || null,
      scheduled_date: form.applicationDate,
      expiration_date: form.expirationDate || null,
      next_dose: form.nextDose || null,
      administration_route: form.administrationRoute,
      dose: form.dose,
      unit: form.unit,
      raw_status: form.status,
      notes: form.observations || null,
    };

    try {
      await addVaccineMutation.mutateAsync({
        petId: appointment.pet_id,
        vaccineData: vaccinePayload,
      });
      setSuccessMessage(text.successMsg);
      setForm(EMPTY_VACCINE_FORM);
      setAttachments({ carnet: null, cert: null, pdf: null });
      setShowForm(false);
      // Scroll back to top to see confirmation message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error saving vaccine:', err);
      setErrorMessage(
        getApiErrorMessage(err, text.errorMsg)
      );
    }
  };

  const handleClearForm = () => {
    setForm(EMPTY_VACCINE_FORM);
    setAttachments({ carnet: null, cert: null, pdf: null });
    setErrorMessage('');
  };

  // Helper colors for statuses
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Aplicada correctamente':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Refuerzo pendiente':
      case 'upcoming':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Esquema completo':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Suspendida':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Aplicada correctamente':
      case 'completed':
        return text.statusApplied;
      case 'Refuerzo pendiente':
      case 'upcoming':
        return text.statusPending;
      case 'Esquema completo':
        return text.statusComplete;
      case 'Suspendida':
        return text.statusSuspended;
      default:
        return status;
    }
  };

  return (
    <main className="vet-vaccines page-container max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        className="flex items-center gap-2 text-teal-600 font-semibold mb-6 hover:text-teal-800 transition"
        to={ROUTES.VET.PATIENT.replace(':appointmentId', appointmentId)}
      >
        <HiArrowLeft className="h-5 w-5" />
        {t('vetPatient.back')}
      </Link>

      {/* Messages */}
      {successMessage && (
        <p className="status-success bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 flex items-center gap-2">
          <HiCheck className="h-5 w-5 shrink-0" />
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="status-error bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 flex items-center gap-2">
          <HiX className="h-5 w-5 shrink-0" />
          {errorMessage}
        </p>
      )}

      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <HiShieldCheck className="h-8 w-8 text-teal-600" />
          {text.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pet info and Vaccines History list */}
        <div className="lg:col-span-2 space-y-8">

          {/* Pet Info Card (Read only, with editable weight) */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HiUser className="text-teal-600 h-5 w-5" />
              {text.petInfo}
            </h2>

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center pb-6 border-b border-slate-100">
              {appointment.pet_photo_url ? (
                <img
                  src={appointment.pet_photo_url}
                  alt={appointment.pet_name}
                  className="h-24 w-24 rounded-3xl object-cover border-2 border-teal-50"
                />
              ) : (
                <span className="h-24 w-24 flex items-center justify-center rounded-3xl bg-teal-50 text-5xl">
                  {SPECIES_ICON[appointment.pet_species] ?? DEFAULT_PET_ICON}
                </span>
              )}

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('vetPatient.name')}</span>
                  <span className="text-lg font-bold text-slate-900">{appointment.pet_name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{text.fileNumber}</span>
                  <span className="text-base font-semibold text-teal-700 bg-teal-50/50 px-2 py-0.5 rounded-lg border border-teal-100">
                    EXP-{appointment.pet_id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('vetPatient.species')}</span>
                  <span className="text-base font-medium text-slate-700">{t(`petSpecies.${appointment.pet_species}`)}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('vetPatient.breed')}</span>
                  <span className="text-base font-medium text-slate-700">{appointment.pet_breed ?? '--'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('vetPatient.sex')}</span>
                  <span className="text-base font-medium text-slate-700">
                    {appointment.pet_sex ? t(`petSex.${appointment.pet_sex}`) : '--'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('vetPatient.age')}</span>
                  <span className="text-base font-medium text-slate-700">{calculateAge(appointment.pet_birth_date, t)}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{text.owner}</span>
                  <span className="text-base font-medium text-slate-700">{appointment.owner_name ?? t('vetPatient.clientFallback')}</span>
                </div>
              </div>
            </div>

            {/* Editable Weight Section */}
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 max-w-md">
                <div className="flex-1">
                  <label htmlFor="weight" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.weight}
                  </label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <HiScale className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      name="weight"
                      id="weight"
                      step="0.01"
                      className="block w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-base"
                      placeholder="e.g. 12.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">{text.weightHelp}</span>
                </div>
                <Button
                  type="button"
                  onClick={handleWeightSave}
                  isLoading={savingWeight}
                  className="sm:mb-6 rounded-2xl shrink-0 h-[48px]"
                >
                  <HiCheck className="h-5 w-5 mr-1" />
                  {text.saveWeight}
                </Button>
              </div>

              {weightMessage.text && (
                <p className={`mt-3 text-sm font-medium ${weightMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {weightMessage.text}
                </p>
              )}
            </div>
          </section>

          {/* Vaccine History List */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HiClipboardList className="text-teal-600 h-5 w-5" />
                {text.history}
              </h2>
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-2xl shadow-sm hover:bg-teal-700 transition"
                >
                  <HiPlus className="h-5 w-5" />
                  {text.applyBtn}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {vaccinesList.length > 0 ? (
                vaccinesList.map((vaccine) => (
                  <article key={vaccine.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{vaccine.name}</h3>
                        <p className="text-sm font-semibold text-teal-600">{vaccine.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(vaccine.raw_status || vaccine.status)}`}>
                        {getStatusLabel(vaccine.raw_status || vaccine.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm text-slate-600 border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.brandLabel}</span>
                        <span className="text-slate-800 font-medium">{vaccine.brand || '--'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.batchLabel}</span>
                        <span className="text-slate-800 font-medium">{vaccine.batch_number || '--'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.appDateLabel}</span>
                        <span className="text-slate-800 font-medium">{formatDate(vaccine.scheduled_date, language)}</span>
                      </div>
                      {vaccine.expiration_date && (
                        <div>
                          <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.expDateLabel}</span>
                          <span className="text-slate-800 font-medium">{formatDate(vaccine.expiration_date, language)}</span>
                        </div>
                      )}
                      {vaccine.next_dose && (
                        <div>
                          <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.nextDoseLabel}</span>
                          <span className="text-slate-800 font-medium">{formatDate(vaccine.next_dose, language)}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.routeLabel}</span>
                        <span className="text-slate-800 font-medium">{vaccine.administration_route || '--'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.doseLabel}</span>
                        <span className="text-slate-800 font-medium">
                          {vaccine.dose} {vaccine.unit}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">{text.vetLabel}</span>
                        <span className="text-slate-800 font-medium">{vaccine.veterinarian_name || '--'}</span>
                      </div>
                    </div>

                    {vaccine.notes && (
                      <div className="mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px] mb-1">{text.obsLabel}</span>
                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">{vaccine.notes}</p>
                      </div>
                    )}

                    {vaccine.attachments && vaccine.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-2">
                          <HiPaperClip className="h-4 w-4" /> {text.attachmentsLabel}
                        </span>
                        {vaccine.attachments.map((file, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1 rounded-xl shadow-xs"
                          >
                            <HiDocumentText className="h-4 w-4 text-teal-600" />
                            <span>{file.name}</span>
                            <span className="text-[10px] text-slate-400">({file.size})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center text-slate-500">
                  <HiShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium">{text.noHistory}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column / Side Card: Apply Vaccine Form */}
        <div className="lg:col-span-1">
          {showForm ? (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">{text.formTitle}</h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                  aria-label={text.cancelBtn}
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">

                {/* 1. Vaccine Dropdown Selection */}
                <div>
                  <label htmlFor="vaccineSelection" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.vaccineLabel} *
                  </label>
                  <select
                    id="vaccineSelection"
                    required
                    value={form.vaccineSelection}
                    onChange={handleFieldChange('vaccineSelection')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">{text.selectVaccinePlaceholder}</option>
                    {suggestions.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                    <option value="custom">{text.customOption}</option>
                  </select>
                </div>

                {/* Custom Vaccine Name (if dropdown is "custom") */}
                {form.vaccineSelection === 'custom' && (
                  <div>
                    <label htmlFor="customVaccineName" className="block text-sm font-bold text-slate-700 mb-1">
                      {text.customVaccineLabel} *
                    </label>
                    <input
                      id="customVaccineName"
                      type="text"
                      required
                      placeholder="e.g. Parvovirus A1"
                      value={form.customVaccineName}
                      onChange={handleFieldChange('customVaccineName')}
                      className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Disease it prevents (Autocompleted) */}
                <div>
                  <label htmlFor="disease" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.diseaseLabel} *
                  </label>
                  <input
                    id="disease"
                    type="text"
                    required
                    placeholder="e.g. Parvovirosis canina"
                    value={form.disease}
                    onChange={handleFieldChange('disease')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Brand / Manufacturer */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.brandLabel} *
                  </label>
                  <input
                    id="brand"
                    type="text"
                    required
                    placeholder="e.g. Zoetis"
                    value={form.brand}
                    onChange={handleFieldChange('brand')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Batch Number */}
                <div>
                  <label htmlFor="batchNumber" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.batchLabel}
                  </label>
                  <input
                    id="batchNumber"
                    type="text"
                    placeholder="e.g. LOTE-2309X"
                    value={form.batchNumber}
                    onChange={handleFieldChange('batchNumber')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Application Date */}
                <div>
                  <label htmlFor="applicationDate" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.appDateLabel} *
                  </label>
                  <input
                    id="applicationDate"
                    type="date"
                    required
                    value={form.applicationDate}
                    onChange={handleFieldChange('applicationDate')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.expDateLabel}
                  </label>
                  <input
                    id="expirationDate"
                    type="date"
                    value={form.expirationDate}
                    onChange={handleFieldChange('expirationDate')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Next dose or booster */}
                <div>
                  <label htmlFor="nextDose" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.nextDoseLabel}
                  </label>
                  <input
                    id="nextDose"
                    type="date"
                    value={form.nextDose}
                    onChange={handleFieldChange('nextDose')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Route of administration */}
                <div>
                  <span className="block text-sm font-bold text-slate-700 mb-2">{text.routeLabel}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Subcutánea', 'Intramuscular', 'Intranasal', 'Oral'].map((r) => (
                      <label
                        key={r}
                        className={`flex items-center gap-2 border rounded-xl p-2.5 cursor-pointer text-xs font-semibold select-none transition ${form.administrationRoute === r
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <input
                          type="radio"
                          name="administrationRoute"
                          value={r}
                          checked={form.administrationRoute === r}
                          onChange={handleFieldChange('administrationRoute')}
                          className="sr-only"
                        />
                        <span>{
                          r === 'Subcutánea' ? text.routeSubcutanea :
                            r === 'Intramuscular' ? text.routeIntramuscular :
                              r === 'Intranasal' ? text.routeIntranasal : text.routeOral
                        }</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dose and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dose" className="block text-sm font-bold text-slate-700 mb-1">
                      {text.doseLabel}
                    </label>
                    <input
                      id="dose"
                      type="text"
                      value={form.dose}
                      onChange={handleFieldChange('dose')}
                      className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="unit" className="block text-sm font-bold text-slate-700 mb-1">
                      {text.unitLabel}
                    </label>
                    <select
                      id="unit"
                      value={form.unit}
                      onChange={handleFieldChange('unit')}
                      className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="ml">ml</option>
                      <option value="mg">mg</option>
                      <option value="dosis">dosis</option>
                    </select>
                  </div>
                </div>

                {/* 3. Responsible professional */}
                <div>
                  <label htmlFor="veterinarian" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.vetLabel}
                  </label>
                  <input
                    id="veterinarian"
                    type="text"
                    value={form.veterinarian ?? user?.full_name ?? ''}
                    onChange={handleFieldChange('veterinarian')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-700 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* 4. Vaccine Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.statusLabel}
                  </label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={handleFieldChange('status')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Aplicada correctamente">{text.statusApplied}</option>
                    <option value="Refuerzo pendiente">{text.statusPending}</option>
                    <option value="Esquema completo">{text.statusComplete}</option>
                    <option value="Suspendida">{text.statusSuspended}</option>
                  </select>
                </div>

                {/* 5. Clinical Observations */}
                <div>
                  <label htmlFor="observations" className="block text-sm font-bold text-slate-700 mb-1">
                    {text.obsLabel}
                  </label>
                  <textarea
                    id="observations"
                    rows={4}
                    placeholder={text.obsPlaceholder}
                    value={form.observations}
                    onChange={handleFieldChange('observations')}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none placeholder-slate-400 text-sm leading-relaxed"
                  />
                </div>

                {/* 6. Attachments (Mock) */}
                <div className="space-y-3 pt-2">
                  <span className="block text-sm font-bold text-slate-700">{text.attachmentsLabel}</span>

                  {/* Carnet Photo */}
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                    <span className="block text-xs font-semibold text-slate-500 mb-2">{text.uploadCard}</span>
                    {attachments.carnet ? (
                      <div className="flex items-center justify-between bg-white border rounded-xl p-2 text-xs text-slate-700">
                        <span className="truncate max-w-[150px] font-medium">{attachments.carnet.name}</span>
                        <button type="button" onClick={() => clearFile('carnet')} className="text-rose-500 hover:text-rose-700 transition">
                          <HiX className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-800 transition">
                        <HiUpload className="h-4 w-4" />
                        <span>Seleccionar archivo...</span>
                        <input type="file" accept="image/*" onChange={handleFileChange('carnet')} className="sr-only" />
                      </label>
                    )}
                  </div>

                  {/* Certificate Photo/Doc */}
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                    <span className="block text-xs font-semibold text-slate-500 mb-2">{text.uploadCert}</span>
                    {attachments.cert ? (
                      <div className="flex items-center justify-between bg-white border rounded-xl p-2 text-xs text-slate-700">
                        <span className="truncate max-w-[150px] font-medium">{attachments.cert.name}</span>
                        <button type="button" onClick={() => clearFile('cert')} className="text-rose-500 hover:text-rose-700 transition">
                          <HiX className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-800 transition">
                        <HiUpload className="h-4 w-4" />
                        <span>Seleccionar archivo...</span>
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange('cert')} className="sr-only" />
                      </label>
                    )}
                  </div>

                  {/* PDF Document */}
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                    <span className="block text-xs font-semibold text-slate-500 mb-2">{text.uploadPdf}</span>
                    {attachments.pdf ? (
                      <div className="flex items-center justify-between bg-white border rounded-xl p-2 text-xs text-slate-700">
                        <span className="truncate max-w-[150px] font-medium">{attachments.pdf.name}</span>
                        <button type="button" onClick={() => clearFile('pdf')} className="text-rose-500 hover:text-rose-700 transition">
                          <HiX className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-800 transition">
                        <HiUpload className="h-4 w-4" />
                        <span>Seleccionar archivo...</span>
                        <input type="file" accept=".pdf" onChange={handleFileChange('pdf')} className="sr-only" />
                      </label>
                    )}
                  </div>
                </div>

                {/* 7. Action Buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                  <Button type="submit" className="w-full justify-center py-3 rounded-2xl">
                    {text.saveBtn}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForm(false)}
                      className="justify-center py-3 rounded-2xl"
                    >
                      {text.cancelBtn}
                    </Button>
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="inline-flex justify-center items-center border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-3 rounded-2xl transition text-sm"
                    >
                      {text.clearBtn}
                    </button>
                  </div>
                </div>

              </form>
            </section>
          ) : (
            /* Call to Action card when form is not shown */
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-md text-center space-y-4 sticky top-6">
              <HiShieldCheck className="h-16 w-16 mx-auto opacity-90" />
              <div>
                <h3 className="text-xl font-bold">{text.formTitle}</h3>
                <p className="text-sm opacity-90 mt-2">
                  Registra de forma detallada una nueva dosis aplicada, su vía de administración, observaciones y adjuntos clínicos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full bg-white text-teal-700 font-bold px-4 py-3.5 rounded-2xl shadow-sm hover:bg-teal-50 transition active:scale-95"
              >
                {text.applyBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
