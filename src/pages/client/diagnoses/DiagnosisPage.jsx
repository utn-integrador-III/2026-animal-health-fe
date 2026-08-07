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
                  diagnoses.map((item) => (
                    <article
                      key={item.id}
                      className="vaccine-card"
                      style={{
                        borderLeft: '4px solid #0d9488',
                        padding: '1.25rem',
                        marginBottom: '1rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <div className="vaccine-card-content" style={{ width: '100%' }}>
                        {/* Header: Title + Status + Meta bar */}
                        <div className="vaccine-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f766e', margin: 0 }}>
                              {item.diagnosis}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.8rem', color: '#6b7280', flexWrap: 'wrap' }}>
                              <span> <strong>{t('diagnoses.consultationDate')}:</strong> {formatDate(item.consultation_date || item.created_at, language)}</span>
                              {item.veterinarian_name && (
                                <span> <strong>{t('diagnoses.veterinarian')}:</strong> {item.veterinarian_name}</span>
                              )}
                            </div>
                          </div>
                          {item.status && (
                            <span className="allergy-badge allergy-badge-moderate" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: '600' }}>
                              {t(`diagnoses.status.${item.status}`) || item.status}
                            </span>
                          )}
                        </div>

                        {/* Divided Sections */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                          {/* 1. Motivo y Síntomas */}
                          {(item.reason || item.symptoms) && (
                            <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #f3f4f6' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                                {t('diagnoses.mainReason')}
                              </h4>
                              {item.reason && (
                                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 0.25rem 0' }}>
                                  <strong>{t('diagnoses.reason')}:</strong> {item.reason}
                                </p>
                              )}
                              {item.symptoms && (
                                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>
                                  <strong>{t('diagnoses.symptoms')}:</strong> {item.symptoms}
                                </p>
                              )}
                            </div>
                          )}

                          {/* 2. Evaluación Médica */}
                          {(item.presumptive_diagnosis || item.differential_diagnoses || item.physical_exam) && (
                            <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #f3f4f6' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                                {t('diagnoses.systemEvaluation')}
                              </h4>
                              {item.presumptive_diagnosis && (
                                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 0.25rem 0' }}>
                                  <strong>{t('diagnoses.presumptiveLabel')}:</strong> {item.presumptive_diagnosis}
                                </p>
                              )}
                              {item.differential_diagnoses && (
                                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 0.25rem 0' }}>
                                  <strong>{t('diagnoses.differentialLabel')}:</strong> {item.differential_diagnoses}
                                </p>
                              )}
                              {item.physical_exam && (
                                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>
                                  <strong>{t('diagnoses.physicalExam')}:</strong> {item.physical_exam}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3. Tratamiento e Indicaciones */}
                        {(item.treatment || item.clinical_plan || item.owner_instructions || item.follow_up) && (
                          <div style={{ backgroundColor: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '0.375rem', border: '1px solid #dcfce7', marginTop: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                              {t('diagnoses.treatmentSummary')}
                            </h4>
                            {item.treatment && (
                              <p style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: '600', margin: '0 0 0.35rem 0' }}>
                                <strong>{t('diagnoses.treatmentLabel')}:</strong> {item.treatment}
                              </p>
                            )}
                            {item.clinical_plan && (
                              <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0 0 0.25rem 0' }}>
                                <strong>{t('diagnoses.clinicalPlan')}:</strong> {item.clinical_plan}
                              </p>
                            )}
                            {item.owner_instructions && (
                              <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0 0 0.25rem 0' }}>
                                <strong>{t('diagnoses.ownerInstructions')}:</strong> {item.owner_instructions}
                              </p>
                            )}
                            {item.follow_up && (
                              <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0 }}>
                                <strong>{t('diagnoses.followUp')}:</strong> {item.follow_up}
                              </p>
                            )}
                          </div>
                        )}

                        {/* 4. Notas adicionales */}
                        {(item.notes || item.clinical_notes) && (
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                            {item.clinical_notes && (
                              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: '0 0 0.2rem 0' }}>
                                {item.clinical_notes}
                              </p>
                            )}
                            {item.notes && (
                              <p style={{ fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic', margin: 0 }}>
                                <strong>{t('diagnoses.clinicalObservations')}:</strong> {item.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
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
