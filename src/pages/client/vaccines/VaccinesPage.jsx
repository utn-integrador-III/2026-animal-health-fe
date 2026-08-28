import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiCalendar, HiShieldCheck } from 'react-icons/hi';

import { ROUTES } from '../../../constants/routes';
import { usePet } from '../../../hooks/usePets';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import useTranslation from '../../../hooks/useTranslation';
import { useVaccinesList } from '../../../hooks/useVaccines';

function formatDate(value, locale) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
}

function VaccineDetailRow({ label, value }) {
  if (!value) return null;
  return (
    <p style={{ fontSize: '0.82rem', color: '#374151', margin: '0.15rem 0' }}>
      <strong style={{ color: '#0f766e' }}>{label}:</strong>{' '}
      <span>{value}</span>
    </p>
  );
}

export default function VaccinesPage() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const petId = searchParams.get('petId');
  const { data: pet, isLoading, isError } = usePet(petId);

  const { data: vaccines = [] } = useVaccinesList(petId);
  const upcomingVaccines = vaccines.filter((vaccine) => vaccine.status === 'upcoming');
  const vaccinationHistory = vaccines.filter((vaccine) => vaccine.status === 'completed');
  const petName = pet?.name ?? t('vaccines.petFallback');

  const backToDashboard = petId
    ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.DASHBOARD;

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        {t('healthSection.back')}
      </Link>

      <section className="health-section-page vaccines-page">
        <div className="vaccines-hero">
          <div>
            <h1 className="page-title">{t('vaccines.title')}</h1>
          </div>
          <div className="appointment-pet-summary vaccines-pet-summary">
            {pet?.photo_url ? (
              <img src={pet.photo_url} alt={petName} />
            ) : (
              <span>{SPECIES_ICON[pet?.species] ?? DEFAULT_PET_ICON}</span>
            )}
            <div>
              <h2>{petName}</h2>
              <p>{pet ? `${t(`petSpecies.${pet.species}`)} - ${t(`petSex.${pet.sex}`)}` : ''}</p>
            </div>
          </div>
        </div>

        {isLoading && <p className="status-error">{t('vaccines.loading')}</p>}
        {isError && <p className="status-error">{t('vaccines.error')}</p>}

        {!isLoading && !isError && (
          <div className="vaccines-content-grid">
            <section className="vaccines-panel">
              <div className="vaccines-panel-header">
                <div>
                  <p className="vaccines-panel-label">{t('vaccines.upcoming')}</p>
                  <h2>{t('vaccines.upcomingTitle')}</h2>
                </div>
                <span className="vaccines-pill">{upcomingVaccines.length}</span>
              </div>

              <div className="vaccines-card-list">
                {upcomingVaccines.length > 0 ? (
                  upcomingVaccines.map((vaccine) => (
                    <article key={vaccine.id} className="vaccine-card vaccine-card-upcoming">
                      <div className="vaccine-card-icon">
                        <HiShieldCheck aria-hidden="true" />
                      </div>
                      <div className="vaccine-card-content">
                        <div className="vaccine-card-header">
                          <h3>{vaccine.name}</h3>
                          <span className="vaccine-status vaccine-status-upcoming">{t('vaccines.upcoming')}</span>
                        </div>
                        <p className="vaccine-card-type">{vaccine.type}</p>
                        <VaccineDetailRow label={t('vaccines.date')} value={formatDate(vaccine.scheduled_date, language)} />
                        <VaccineDetailRow label={t('vaccines.brand')} value={vaccine.brand} />
                        <VaccineDetailRow label={t('vaccines.dose')} value={vaccine.dose ? `${vaccine.dose} ${vaccine.unit ?? ''}`.trim() : null} />
                        <VaccineDetailRow label={t('vaccines.route')} value={vaccine.administration_route} />
                        <VaccineDetailRow label={t('vaccines.nextDose')} value={formatDate(vaccine.next_dose, language)} />
                        <VaccineDetailRow label={t('vaccines.expiration')} value={formatDate(vaccine.expiration_date, language)} />
                        <VaccineDetailRow label={t('vaccines.batch')} value={vaccine.batch_number} />
                        <VaccineDetailRow label={t('vaccines.veterinarian')} value={vaccine.veterinarian_name} />
                        {vaccine.notes && <p className="vaccine-card-notes">{vaccine.notes}</p>}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="vaccines-empty-state">
                    <HiCalendar aria-hidden="true" />
                    <p>{t('vaccines.noneScheduled')}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="vaccines-panel">
              <div className="vaccines-panel-header">
                <div>
                  <p className="vaccines-panel-label">{t('vaccines.history')}</p>
                  <h2>{t('vaccines.historyTitle')}</h2>
                </div>
                <span className="vaccines-pill">{vaccinationHistory.length}</span>
              </div>

              <div className="vaccines-card-list">
                {vaccinationHistory.length > 0 ? (
                  vaccinationHistory.map((vaccine) => (
                    <article key={vaccine.id} className="vaccine-card">
                      <div className="vaccine-card-icon">
                        <HiShieldCheck aria-hidden="true" />
                      </div>
                      <div className="vaccine-card-content">
                        <div className="vaccine-card-header">
                          <h3>{vaccine.name}</h3>
                          <span className="vaccine-status">{t('vaccines.history')}</span>
                        </div>
                        <p className="vaccine-card-type">{vaccine.type}</p>
                        <VaccineDetailRow label={t('vaccines.date')} value={formatDate(vaccine.scheduled_date, language)} />
                        <VaccineDetailRow label={t('vaccines.brand')} value={vaccine.brand} />
                        <VaccineDetailRow label={t('vaccines.dose')} value={vaccine.dose ? `${vaccine.dose} ${vaccine.unit ?? ''}`.trim() : null} />
                        <VaccineDetailRow label={t('vaccines.route')} value={vaccine.administration_route} />
                        <VaccineDetailRow label={t('vaccines.nextDose')} value={formatDate(vaccine.next_dose, language)} />
                        <VaccineDetailRow label={t('vaccines.expiration')} value={formatDate(vaccine.expiration_date, language)} />
                        <VaccineDetailRow label={t('vaccines.batch')} value={vaccine.batch_number} />
                        <VaccineDetailRow label={t('vaccines.veterinarian')} value={vaccine.veterinarian_name} />
                        {vaccine.notes && <p className="vaccine-card-notes">{vaccine.notes}</p>}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="vaccines-empty-state">
                    <HiCalendar aria-hidden="true" />
                    <p>{t('vaccines.historyEmpty')}</p>
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
