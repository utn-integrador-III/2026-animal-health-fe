import { Link, useSearchParams } from 'react-router-dom';
import { HiCalendar, HiClipboardList } from 'react-icons/hi';

import { ROUTES } from '../../../constants/routes';
import { usePet } from '../../../hooks/usePets';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import useTranslation from '../../../hooks/useTranslation';
import { useClinicalRecordsList } from '../../../hooks/useMedical';

function formatDate(value, locale) {
  if (!value) return '--';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export default function PetMedicalHistory() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const petId = searchParams.get('petId');
  const { data: pet, isLoading: loadingPet, isError: errorPet } = usePet(petId);
  const { data: records = [], isLoading: loadingRecords, isError: errorRecords } = useClinicalRecordsList(petId);

  const petName = pet?.name ?? t('vaccines.petFallback');
  const backToDashboard = petId
    ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.DASHBOARD;

  const isLoading = loadingPet || loadingRecords;
  const isError = errorPet || errorRecords;

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        {t('healthSection.back')}
      </Link>

      <section className="health-section-page medical-history-page">
        <div className="vaccines-hero">
          <div>
            <h1 className="page-title">{t('diagnostics.title')}</h1>
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

        {isLoading && <p className="status-error">{t('appointments.loading')}</p>}
        {isError && <p className="status-error">{t('appointments.loadError')}</p>}

        {!isLoading && !isError && (
          <div className="vaccines-content-grid">
            <section className="vaccines-panel !col-span-full">
              <div className="vaccines-panel-header">
                <div>
                  <p className="vaccines-panel-label">{t('diagnostics.title')}</p>
                  <h2>{t('vetPatient.completeChangesTitle')}</h2>
                </div>
                <span className="vaccines-pill">{records.length}</span>
              </div>

              <div className="mt-6 overflow-x-auto">
                {records.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-3">{t('diagnostics.table.date')}</th>
                        <th className="px-6 py-3">{t('diagnostics.table.diagnosis')}</th>
                        <th className="px-6 py-3">{t('diagnostics.table.treatment')}</th>
                        <th className="px-6 py-3">{t('diagnostics.table.vet')}</th>
                        <th className="px-6 py-3">{t('diagnostics.table.weight')}</th>
                        <th className="px-6 py-3">{t('diagnostics.table.notes')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 bg-white">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                            {formatDate(record.date, language)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-teal-700">{record.diagnosis}</td>
                          <td className="px-6 py-4">{record.treatment}</td>
                          <td className="whitespace-nowrap px-6 py-4">{record.veterinarian_name}</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {record.weight_kg ? `${record.weight_kg} kg` : '--'}
                          </td>
                          <td className="px-6 py-4 text-xs italic text-gray-500">{record.notes ?? '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="vaccines-empty-state py-12 flex flex-col items-center justify-center text-gray-400">
                    <HiClipboardList className="text-5xl mb-2" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('diagnostics.emptyTitle')}</h3>
                    <p className="text-sm mt-1">{t('diagnostics.emptyDescription')}</p>
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
