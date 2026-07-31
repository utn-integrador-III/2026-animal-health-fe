import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiExclamation, HiPlus, HiX } from 'react-icons/hi';
import Swal from 'sweetalert2';

import { ROUTES } from '../../../constants/routes';
import { usePet } from '../../../hooks/usePets';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import useTranslation from '../../../hooks/useTranslation';
import { useAllergiesList, useAddAllergy } from '../../../hooks/useAllergies';

const SEVERITY_COLORS = {
  mild: 'allergy-badge allergy-badge-mild',
  moderate: 'allergy-badge allergy-badge-moderate',
  severe: 'allergy-badge allergy-badge-severe',
};

const CATEGORY_VALUES = ['food', 'environmental', 'medication', 'other'];
const SEVERITY_VALUES = ['mild', 'moderate', 'severe'];

const EMPTY_FORM = {
  allergen: '',
  category: '',
  severity: '',
  reaction: '',
  notes: '',
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

export default function AllergiesPage() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const petId = searchParams.get('petId');
  const { data: pet, isLoading: loadingPet, isError: errorPet } = usePet(petId);
  const {
    data: allergies = [],
    isLoading: loadingAllergies,
    isError: errorAllergies,
  } = useAllergiesList(petId);
  const addAllergy = useAddAllergy();

  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const petName = pet?.name ?? t('allergies.petFallback');
  const backToDashboard = petId
    ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.DASHBOARD;

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.allergen.trim()) {
      Swal.fire({ icon: 'warning', title: t('allergies.allergenRequired'), showConfirmButton: false, timer: 2000 });
      return;
    }
    if (!form.category) {
      Swal.fire({ icon: 'warning', title: t('allergies.categoryRequired'), showConfirmButton: false, timer: 2000 });
      return;
    }
    if (!form.severity) {
      Swal.fire({ icon: 'warning', title: t('allergies.severityRequired'), showConfirmButton: false, timer: 2000 });
      return;
    }
    try {
      await addAllergy.mutateAsync({ petId, allergyData: form });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: t('allergies.saveSuccess'),
        showConfirmButton: false,
        timer: 2500,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t('allergies.saveError'),
      });
    }
  };

  const isLoading = loadingPet || loadingAllergies;
  const isError = errorPet || errorAllergies;

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        {t('healthSection.back')}
      </Link>

      <section className="health-section-page vaccines-page">
        {/* Hero */}
        <div className="vaccines-hero">
          <div>
            <h1 className="page-title">{t('allergies.title')}</h1>
            <p className="page-subtitle">{t('allergies.subtitle')}</p>
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
        {isLoading && <p className="status-success">{t('allergies.loading')}</p>}
        {isError && <p className="status-error">{t('allergies.error')}</p>}

        {!isLoading && !isError && (
          <div className="vaccines-content-grid" style={{ gridTemplateColumns: '1fr' }}>
            {/* Add allergy toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button
                id="allergies-toggle-form-btn"
                type="button"
                className="btn btn-primary"
                onClick={() => setShowForm((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {showForm ? <HiX aria-hidden="true" /> : <HiPlus aria-hidden="true" />}
                {showForm ? t('allergies.cancelEdit') : t('allergies.addButton')}
              </button>
            </div>

            {/* Add Allergy Form */}
            {showForm && (
              <section className="vaccines-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="vaccines-panel-header">
                  <h2>{t('allergies.addTitle')}</h2>
                </div>
                <form
                  id="allergies-add-form"
                  className="vet-followup-form"
                  onSubmit={handleSubmit}
                  style={{ padding: '1rem 0' }}
                >
                  <label>
                    {t('allergies.allergen')} *
                    <input
                      id="allergy-allergen"
                      required
                      value={form.allergen}
                      onChange={updateField('allergen')}
                      placeholder={t('allergies.allergenPlaceholder')}
                    />
                  </label>

                  <label>
                    {t('allergies.category')} *
                    <select
                      id="allergy-category"
                      required
                      value={form.category}
                      onChange={updateField('category')}
                    >
                      <option value="">--</option>
                      {CATEGORY_VALUES.map((cat) => (
                        <option key={cat} value={cat}>
                          {t(`allergies.category.${cat}`)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    {t('allergies.severity')} *
                    <select
                      id="allergy-severity"
                      required
                      value={form.severity}
                      onChange={updateField('severity')}
                    >
                      <option value="">--</option>
                      {SEVERITY_VALUES.map((sev) => (
                        <option key={sev} value={sev}>
                          {t(`allergies.severity.${sev}`)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    {t('allergies.reaction')}
                    <input
                      id="allergy-reaction"
                      value={form.reaction}
                      onChange={updateField('reaction')}
                      placeholder={t('allergies.reactionPlaceholder')}
                    />
                  </label>

                  <label className="vet-followup-wide">
                    {t('allergies.notes')}
                    <textarea
                      id="allergy-notes"
                      value={form.notes}
                      onChange={updateField('notes')}
                      placeholder={t('allergies.notesPlaceholder')}
                    />
                  </label>

                  <div className="vet-followup-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setForm(EMPTY_FORM); setShowForm(false); }}
                    >
                      {t('allergies.cancelEdit')}
                    </button>
                    <button
                      id="allergies-submit-btn"
                      type="submit"
                      className="btn btn-primary"
                      disabled={addAllergy.isPending}
                    >
                      {addAllergy.isPending ? '...' : t('allergies.addButton')}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Allergy List */}
            <section className="vaccines-panel">
              <div className="vaccines-panel-header">
                <div>
                  <p className="vaccines-panel-label">{t('allergies.title')}</p>
                  <h2>{petName}</h2>
                </div>
                <span className="vaccines-pill">{allergies.length}</span>
              </div>

              <div className="vaccines-card-list">
                {allergies.length > 0 ? (
                  allergies.map((allergy) => (
                    <article
                      key={allergy.id}
                      className="vaccine-card"
                      style={{ borderLeft: `4px solid var(--color-primary, #0d9488)` }}
                    >
                      <div className="vaccine-card-icon" style={{ color: 'var(--color-primary, #0d9488)' }}>
                        <HiExclamation aria-hidden="true" />
                      </div>
                      <div className="vaccine-card-content">
                        <div className="vaccine-card-header">
                          <h3>{allergy.allergen}</h3>
                          <span
                            className={
                              SEVERITY_COLORS[allergy.severity?.toLowerCase()] ??
                              'allergy-badge allergy-badge-mild'
                            }
                          >
                            {t(`allergies.severity.${allergy.severity?.toLowerCase()}`) || allergy.severity}
                          </span>
                        </div>
                        <p className="vaccine-card-type">
                          {t(`allergies.category.${allergy.category?.toLowerCase()}`) || allergy.category}
                        </p>
                        {allergy.reaction && (
                          <p style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.25rem' }}>
                            <strong>{t('allergies.reaction')}:</strong> {allergy.reaction}
                          </p>
                        )}
                        {allergy.notes && (
                          <p style={{ fontSize: '0.78rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.2rem' }}>
                            {allergy.notes}
                          </p>
                        )}
                        <div className="vaccine-card-meta">
                          <span>
                            {t('allergies.date')}: {formatDate(allergy.created_at, language)}
                          </span>
                          {allergy.veterinarian_name && (
                            <span>
                              {t('allergies.veterinarian')}: {allergy.veterinarian_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="vaccines-empty-state">
                    <HiExclamation aria-hidden="true" />
                    <p>{t('allergies.empty')}</p>
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
