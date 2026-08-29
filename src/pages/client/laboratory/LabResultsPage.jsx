import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HiBeaker,
  HiClock,
  HiCheckCircle,
  HiDownload,
  HiEye,
  HiInformationCircle,
  HiX,
  HiDocumentText,
} from 'react-icons/hi';

import { ROUTES } from '../../../constants/routes';
import { usePet, usePetsList } from '../../../hooks/usePets';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import useTranslation from '../../../hooks/useTranslation';
import { useLabResultsList } from '../../../hooks/useLabResults';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

function formatDate(value, locale) {
  if (!value) return '--';
  try {
    const cleanDate = typeof value === 'string' && value.includes('T')
      ? value
      : `${value}T00:00:00`;
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(cleanDate));
  } catch {
    return value;
  }
}

export default function LabResultsPage() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const rawPetId = searchParams.get('petId');
  const petsQuery = typeof usePetsList === 'function' ? usePetsList() : null;
  const pets = petsQuery?.data || [];
  const petId = rawPetId || pets[0]?.id;
  const { data: pet, isLoading: loadingPet, isError: errorPet } = usePet(petId);
  const {
    data: labResults = [],
    isLoading: loadingLab,
    isError: errorLab,
  } = useLabResultsList(petId);

  const [previewFile, setPreviewFile] = useState(null); // { url, name, type }

  const petName = pet?.name ?? t('vaccines.petFallback');
  const backToDashboard = petId
    ? `${ROUTES.CLIENT.DASHBOARD}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.DASHBOARD;

  const isLoading = loadingPet || loadingLab;
  const isError = errorPet || errorLab;

  const availableCount = labResults.filter(
    (item) => item.status === 'Resultado disponible' || Boolean(item.file_url)
  ).length;
  const pendingCount = labResults.length - availableCount;

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backToDashboard}>
        {t('healthSection.back')}
      </Link>

      <section className="health-section-page vaccines-page">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="vaccines-hero">
          <div>
            <h1 className="page-title">{t('lab.title')}</h1>
            <p className="page-subtitle">{t('lab.subtitle')}</p>
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

        {/* ── Stats Summary ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-lg text-2xl">
              <HiBeaker />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Exámenes</p>
              <p className="text-2xl font-bold text-slate-800">{labResults.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-2xl">
              <HiCheckCircle />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Resultados Disponibles</p>
              <p className="text-2xl font-bold text-green-700">{availableCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-2xl">
              <HiClock />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">En Proceso / Solicitados</p>
              <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* ── State Feedback ───────────────────────────────────── */}
        {isLoading && <Loader label="Cargando resultados de laboratorio..." />}
        {isError && <p className="status-error">No se pudieron cargar los resultados de laboratorio.</p>}

        {/* ── Lab Results List ─────────────────────────────────── */}
        {!isLoading && !isError && (
          <section className="vaccines-panel" style={{ width: '100%' }}>
            <div className="vaccines-panel-header">
              <div>
                <p className="vaccines-panel-label">{t('lab.title')}</p>
                <h2>Historial de Exámenes</h2>
              </div>
              <span className="vaccines-pill">{labResults.length}</span>
            </div>

            <div className="space-y-4 mt-6">
              {labResults.length > 0 ? (
                labResults.map((item) => {
                  const isAvailable =
                    item.status === 'Resultado disponible' || Boolean(item.file_url);
                  const isUrgent =
                    item.priority?.toLowerCase() === 'urgente' ||
                    item.priority?.toLowerCase() === 'urgent';

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                      style={{
                        borderLeft: isAvailable
                          ? '5px solid #10b981'
                          : isUrgent
                          ? '5px solid #ef4444'
                          : '5px solid #f59e0b',
                      }}
                    >
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900">
                              {item.test_type || item.exam_type || 'Examen de laboratorio'}
                            </h3>
                            {isUrgent && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                🚨 {t('lab.priority.urgente')}
                              </span>
                            )}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === 'Cancelado'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.status || 'Solicitado'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            <span>
                              <strong>{t('lab.requestDate')}:</strong>{' '}
                              {formatDate(item.requested_at || item.test_date || item.created_at, language)}
                            </span>
                            {item.veterinarian_name && (
                              <span className="ml-3">
                                <strong>{t('lab.requestingVet')}:</strong> {item.veterinarian_name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Motivo y Observaciones de Solicitud */}
                      {(item.reason || item.clinical_observations) && (
                        <div className="my-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {item.reason && (
                            <p className="text-slate-700">
                              <strong>{t('lab.reason')}:</strong> {item.reason}
                            </p>
                          )}
                          {item.clinical_observations && (
                            <p className="text-slate-600 text-xs mt-1">
                              <strong>{t('lab.clinicalObservations')}:</strong> {item.clinical_observations}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Estado: Pendiente vs Disponible */}
                      {!isAvailable ? (
                        <div className="mt-3 p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-3">
                          <HiInformationCircle className="text-2xl text-amber-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-amber-900">
                              {t('lab.pendingResultNotice')}
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              El examen se encuentra en proceso de análisis por el laboratorio.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-4 bg-green-50/40 border border-green-200/80 rounded-xl space-y-3">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-xs font-semibold text-green-900">
                              ✅ Resultado Disponible
                            </span>
                            {item.result_date && (
                              <span className="text-xs text-slate-500">
                                <strong>{t('lab.resultDate')}:</strong> {formatDate(item.result_date, language)}
                              </span>
                            )}
                          </div>

                          {(item.summary || item.result_summary) && (
                            <div>
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                {t('lab.summary')}
                              </p>
                              <p className="text-sm text-slate-800 mt-0.5">
                                {item.summary || item.result_summary}
                              </p>
                            </div>
                          )}

                          {item.observations && (
                            <div>
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                {t('lab.observations')}
                              </p>
                              <p className="text-sm text-slate-700 mt-0.5">
                                {item.observations}
                              </p>
                            </div>
                          )}

                          {item.recommendation && (
                            <div>
                              <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                                {t('lab.recommendation')}
                              </p>
                              <p className="text-sm text-teal-900 font-medium mt-0.5">
                                {item.recommendation}
                              </p>
                            </div>
                          )}

                          {/* Botones de acción para ver y descargar */}
                          {item.file_url && (
                            <div className="pt-2 flex items-center gap-3 border-t border-green-200/60">
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg"
                              >
                                <HiEye className="text-base" />
                                {t('lab.viewResult')}
                              </a>
                              <a
                                href={item.file_url}
                                download={item.file_name || `resultado_${item.test_type}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary inline-flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg"
                              >
                                <HiDownload className="text-base" />
                                {t('lab.downloadPdf')}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="vaccines-empty-state py-12 flex flex-col items-center justify-center text-slate-400">
                  <HiDocumentText className="text-5xl mb-2 text-slate-300" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-slate-700">{t('lab.title')}</h3>
                  <p className="text-sm mt-1">{t('lab.noResults')}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
