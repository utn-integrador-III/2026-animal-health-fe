import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiDocumentText, HiPlus, HiX, HiClipboardList } from 'react-icons/hi';
import Swal from 'sweetalert2';

import { ROUTES } from '../../../constants/routes';
import { usePet } from '../../../hooks/usePets';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import useTranslation from '../../../hooks/useTranslation';
import useAuthStore from '../../../stores/useAuthStore';
import { useDiagnosesList, useAddDiagnosis } from '../../../hooks/useDiagnoses';
import VetDiagnosisForm from '../../../components/veterinarian/VetDiagnosisForm';
import DiagnosisSummaryCard from '../../../components/cards/DiagnosisSummaryCard';

const EMPTY_FORM = {
  diagnosis: '',
  presumptive_diagnosis: '',
  differential_diagnoses: '',
  status: 'Presuntivo',
  treatment: '',
  notes: '',
  consultation_date: new Date().toISOString().split('T')[0],
  reason: '',
  symptoms: '',
  physical_exam: '',
  clinical_plan: '',
  owner_instructions: '',
  follow_up: '',
};

function formatDate(value, locale) {
  if (!value) return '--';
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function DiagnosisPage() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const petId = searchParams.get('petId');
  const user = useAuthStore((state) => state.user);
  const isVet = user?.role === 'veterinarian';

  const { data: pet, isLoading: loadingPet, isError: errorPet } = usePet(petId);
  const {
    data: diagnoses = [],
    isLoading: loadingDiagnoses,
    isError: errorDiagnoses,
  } = useDiagnosesList(petId);
  const addDiagnosisMutation = useAddDiagnosis();

  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const petName = pet?.name ?? t('allergies.petFallback');
  const backToDashboard = isVet
    ? ROUTES.VET.DASHBOARD
    : (petId ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}` : ROUTES.CLIENT.DASHBOARD);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.diagnosis.trim()) {
      Swal.fire({
        icon: 'warning',
        title: t('diagnoses.diagnosisRequired'),
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }
    try {
      await addDiagnosisMutation.mutateAsync({ petId, diagnosisData: form });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: t('diagnoses.saveSuccess'),
        showConfirmButton: false,
        timer: 2500,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t('diagnoses.saveError'),
      });
    }
  };

  const isLoading = loadingPet || loadingDiagnoses;
  const isError = errorPet || errorDiagnoses;

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        {t('healthSection.back')}
      </Link>

      <section className="health-section-page vaccines-page">
        {/* Hero Header */}
        <div className="vaccines-hero">
          <div>
            <h1 className="page-title">{t('diagnoses.title')}</h1>
            <p className="page-subtitle">{t('diagnoses.subtitle')}</p>
          </div>
          <div className="appointment-pet-summary vaccines-pet-summary">
            {pet?.photo_url ? (
              <img src={pet.photo_url} alt={petName} />
            ) : (
              <span>{SPECIES_ICON[pet?.species] ?? DEFAULT_PET_ICON}</span>
            )}
            <div>
              <h2>{petName}</h2>
              <p>{pet ? `${t(`petSpecies.${pet.species}`)} – ${t(`petSex.${pet.sex}`)}` : ''}</p>
            </div>
          </div>
        </div>

        {/* State feedback */}
        {isLoading && <p className="status-success">{t('diagnoses.loading')}</p>}
        {isError && <p className="status-error">{t('diagnoses.error')}</p>}

        {!isLoading && !isError && (
          <div className="vaccines-content-grid" style={{ gridTemplateColumns: '1fr' }}>
            {/* Vet Action: Add Diagnosis Toggle */}
            {isVet && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                  id="diagnoses-toggle-form-btn"
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowForm((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {showForm ? <HiX aria-hidden="true" /> : <HiPlus aria-hidden="true" />}
                  {showForm ? t('diagnoses.cancel') : t('diagnoses.addButton')}
                </button>
              </div>
            )}

            {/* Vet Add Diagnosis Form (Full Layout matching image) */}
            {isVet && showForm && (
              <div style={{ marginBottom: '1.5rem' }}>
                <VetDiagnosisForm
                  pet={pet}
                  veterinarian={user}
                  isPending={addDiagnosisMutation.isPending}
                  onCancel={() => setShowForm(false)}
                  onSubmit={async (payload) => {
                    try {
                      await addDiagnosisMutation.mutateAsync({ petId, diagnosisData: payload });
                      Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: t('diagnoses.saveSuccess'),
                        showConfirmButton: false,
                        timer: 2500,
                      });
                      setShowForm(false);
                    } catch {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: t('diagnoses.saveError'),
                      });
                    }
                  }}
                />
              </div>
            )}

            {/* Diagnosis List / Cards Section */}
            <section className="vaccines-panel">
              <div className="vaccines-panel-header">
                <div>
                  <p className="vaccines-panel-label">{t('diagnoses.title')}</p>
                  <h2>{petName}</h2>
                </div>
                <span className="vaccines-pill">{diagnoses.length}</span>
              </div>

              <div className="vaccines-card-list">
                {diagnoses.length > 0 ? (
                  diagnoses.map((item, idx) => (
                    <DiagnosisSummaryCard key={item.id || idx} item={item} />
                  ))
                ) : (
                  <div className="vaccines-empty-state">
                    <HiClipboardList aria-hidden="true" style={{ fontSize: '2.5rem', color: '#9ca3af' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginTop: '0.5rem' }}>
                      {t('diagnoses.empty')}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {t('diagnoses.emptyDescription')}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
