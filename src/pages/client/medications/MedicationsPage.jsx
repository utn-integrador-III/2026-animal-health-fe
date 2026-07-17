import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiCalendar, HiSparkles, HiCheckCircle } from 'react-icons/hi';
import { HiOutlineXCircle } from 'react-icons/hi2';
import Swal from 'sweetalert2';

import { ROUTES } from '../../../constants/routes';
import { usePet } from '../../../hooks/usePets';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import useTranslation from '../../../hooks/useTranslation';
import { useMedicationsList, useToggleMedicationCheck } from '../../../hooks/useMedical';

function formatDate(value, locale) {
  if (!value) return '--';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export default function MedicationsPage() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const petId = searchParams.get('petId');
  const { data: pet, isLoading: loadingPet, isError: errorPet } = usePet(petId);
  const { data: medications = [], isLoading: loadingMeds, isError: errorMeds } = useMedicationsList(petId);
  const toggleCheck = useToggleMedicationCheck();

  const petName = pet?.name ?? t('vaccines.petFallback');
  const backToDashboard = petId
    ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.DASHBOARD;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter medications
  const activeMedications = useMemo(() => {
    return medications.filter((m) => m.status === 'active');
  }, [medications]);

  const historyMedications = useMemo(() => {
    return medications.filter((m) => m.status === 'completed');
  }, [medications]);

  // Medications that require reminder checks today (active and covers today)
  const todayReminders = useMemo(() => {
    return activeMedications.filter((m) => {
      return m.start_date <= todayStr && m.end_date >= todayStr;
    });
  }, [activeMedications, todayStr]);

  const handleToggle = async (medicationId, isTaken) => {
    try {
      await toggleCheck.mutateAsync({
        petId,
        medicationId,
        date: todayStr,
      });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: t('medications.checkSuccess'),
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.detail || 'Could not update status',
      });
    }
  };

  const isLoading = loadingPet || loadingMeds;
  const isError = errorPet || errorMeds;

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        {t('healthSection.back')}
      </Link>

      <section className="health-section-page medications-page">
        <div className="vaccines-hero">
          <div>
            <h1 className="page-title">{t('medications.title')}</h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            
            {/* Daily Reminders Checklist */}
            <section className="vaccines-panel lg:col-span-1 bg-teal-50/50 border border-teal-100 rounded-xl p-6">
              <div className="vaccines-panel-header mb-4">
                <div>
                  <p className="vaccines-panel-label text-teal-800">{t('medications.dailyChecklist')}</p>
                  <h2 className="text-xl font-bold text-gray-900">{t('medications.dailyChecklistSubtitle')}</h2>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                {todayReminders.length > 0 ? (
                  todayReminders.map((med) => {
                    const isTaken = med.checked_dates.includes(todayStr);
                    return (
                      <div
                        key={med.id}
                        onClick={() => handleToggle(med.id, isTaken)}
                        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all border ${
                          isTaken
                            ? 'bg-teal-50 border-teal-200 text-teal-900'
                            : 'bg-white border-gray-200 hover:border-teal-300 text-gray-700'
                        }`}
                      >
                        <button
                          type="button"
                          className="text-2xl flex-shrink-0 transition-transform duration-200 hover:scale-110"
                        >
                          {isTaken ? (
                            <HiCheckCircle className="text-teal-600" />
                          ) : (
                            <HiOutlineXCircle className="text-gray-400 hover:text-teal-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isTaken ? 'line-through text-teal-700/70' : 'text-gray-900'}`}>
                            {med.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {med.dosage} • {med.frequency}
                          </p>
                          {med.notes && (
                            <p className="text-xs text-gray-400 italic mt-1">{med.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <HiCheckCircle className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">{t('medications.noActive')}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Active & Historical Treatments */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Treatments */}
              <section className="vaccines-panel">
                <div className="vaccines-panel-header">
                  <div>
                    <p className="vaccines-panel-label">{t('medications.title')}</p>
                    <h2>{t('medications.activeTreatments')}</h2>
                  </div>
                  <span className="vaccines-pill">{activeMedications.length}</span>
                </div>

                <div className="vaccines-card-list mt-6">
                  {activeMedications.length > 0 ? (
                    activeMedications.map((med) => (
                      <article key={med.id} className="vaccine-card vaccine-card-upcoming">
                        <div className="vaccine-card-icon bg-amber-50 text-amber-600">
                          <HiSparkles aria-hidden="true" />
                        </div>
                        <div className="vaccine-card-content">
                          <div className="vaccine-card-header">
                            <h3>{med.name}</h3>
                            <span className="vaccine-status vaccine-status-upcoming">{med.dosage}</span>
                          </div>
                          <p className="vaccine-card-type font-medium text-teal-800">{med.frequency}</p>
                          <div className="vaccine-card-meta">
                            <span>
                              <HiCalendar aria-hidden="true" />
                              {formatDate(med.start_date, language)} - {formatDate(med.end_date, language)}
                            </span>
                          </div>
                          {med.notes && (
                            <p className="vaccine-card-notes border-t border-gray-100 pt-2 mt-2">
                              <strong>{t('medications.notes')}:</strong> {med.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {t('medications.vet')}: {med.veterinarian_name}
                          </p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="vaccines-empty-state">
                      <HiCalendar aria-hidden="true" />
                      <p>{t('medications.noActive')}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Prescription History */}
              <section className="vaccines-panel">
                <div className="vaccines-panel-header">
                  <div>
                    <p className="vaccines-panel-label">{t('medications.title')}</p>
                    <h2>{t('medications.history')}</h2>
                  </div>
                  <span className="vaccines-pill bg-gray-200 text-gray-700">{historyMedications.length}</span>
                </div>

                <div className="vaccines-card-list mt-6">
                  {historyMedications.length > 0 ? (
                    historyMedications.map((med) => (
                      <article key={med.id} className="vaccine-card opacity-75">
                        <div className="vaccine-card-icon bg-gray-100 text-gray-500">
                          <HiCalendar aria-hidden="true" />
                        </div>
                        <div className="vaccine-card-content">
                          <div className="vaccine-card-header">
                            <h3>{med.name}</h3>
                            <span className="vaccine-status bg-gray-100 text-gray-600">{med.dosage}</span>
                          </div>
                          <p className="vaccine-card-type text-gray-500">{med.frequency}</p>
                          <div className="vaccine-card-meta">
                            <span>
                              <HiCalendar aria-hidden="true" />
                              {formatDate(med.start_date, language)} - {formatDate(med.end_date, language)}
                            </span>
                          </div>
                          {med.notes && (
                            <p className="vaccine-card-notes border-t border-gray-100 pt-2 mt-2 text-gray-500">
                              <strong>{t('medications.notes')}:</strong> {med.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {t('medications.vet')}: {med.veterinarian_name}
                          </p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="vaccines-empty-state">
                      <HiCalendar aria-hidden="true" />
                      <p>{t('medications.noHistory')}</p>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        )}
      </section>
    </main>
  );
}
