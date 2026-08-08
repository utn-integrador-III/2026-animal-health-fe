/**
 * VetMedicalHistory.jsx — FE-US-06
 *
 * Full medical history timeline for a veterinarian viewing a patient.
 * Displays consultations, diagnoses, medications, vaccines, lab results
 * on a chronological timeline, and allergies as severity-coded badges.
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiBeaker,
  HiChevronDown,
  HiChevronUp,
  HiClipboardList,
  HiExclamation,
  HiShieldCheck,
  HiSparkles,
  HiUserCircle,
} from 'react-icons/hi';

import Loader from '../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../constants/petConstants';
import { ROUTES } from '../../constants/routes';
import { useAppointments } from '../../hooks/useAppointments';
import { useMedicalHistory, TIMELINE_TYPES } from '../../hooks/useMedicalHistory';
import useTranslation from '../../hooks/useTranslation';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(value, language) {
  if (!value) return '--';
  try {
    const d = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat(language === 'es' ? 'es-AR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return value;
  }
}

function calculateAge(birthDate) {
  if (!birthDate) return '--';
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  return `${years} año${years !== 1 ? 's' : ''}`;
}

// ─── Filter config ────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'all', label: { es: 'Todo', en: 'All' }, icon: <HiClipboardList /> },
  { key: TIMELINE_TYPES.CONSULTATION, label: { es: 'Consultas', en: 'Consultations' }, icon: <HiClipboardList /> },
  { key: TIMELINE_TYPES.DIAGNOSIS, label: { es: 'Diagnósticos', en: 'Diagnoses' }, icon: <HiSparkles /> },
  { key: TIMELINE_TYPES.MEDICATION, label: { es: 'Tratamientos', en: 'Treatments' }, icon: <HiSparkles /> },
  { key: TIMELINE_TYPES.VACCINE, label: { es: 'Vacunas', en: 'Vaccines' }, icon: <HiShieldCheck /> },
  { key: TIMELINE_TYPES.LAB, label: { es: 'Laboratorio', en: 'Lab Results' }, icon: <HiBeaker /> },
];

// ─── Type metadata ────────────────────────────────────────────────────────────

const TYPE_META = {
  [TIMELINE_TYPES.CONSULTATION]: {
    dot: '🩺',
    label: { es: 'Registro clínico', en: 'Clinical Record' },
  },
  [TIMELINE_TYPES.DIAGNOSIS]: {
    dot: '🧬',
    label: { es: 'Diagnóstico', en: 'Diagnosis' },
  },
  [TIMELINE_TYPES.MEDICATION]: {
    dot: '💊',
    label: { es: 'Tratamiento', en: 'Medication' },
  },
  [TIMELINE_TYPES.VACCINE]: {
    dot: '💉',
    label: { es: 'Vacuna', en: 'Vaccine' },
  },
  [TIMELINE_TYPES.LAB]: {
    dot: '🔬',
    label: { es: 'Lab', en: 'Lab Result' },
  },
};

// ─── Allergy severity helpers ────────────────────────────────────────────────

function severityClass(severity) {
  const s = (severity || '').toLowerCase();
  if (s === 'severe') return 'vet-allergy-badge--severe';
  if (s === 'moderate') return 'vet-allergy-badge--moderate';
  return 'vet-allergy-badge--mild';
}

function severityLabel(severity, language) {
  const s = (severity || '').toLowerCase();
  const map = {
    mild: { es: 'Leve', en: 'Mild' },
    moderate: { es: 'Moderada', en: 'Moderate' },
    severe: { es: 'Grave', en: 'Severe' },
  };
  return map[s]?.[language] ?? severity;
}

// ─── Event card renderers ────────────────────────────────────────────────────

function ConsultationCard({ raw, language }) {
  return (
    <>
      <p className="vet-history-event-title">{raw.diagnosis || '—'}</p>
      {raw.treatment && (
        <div className="vet-history-event-row">
          <strong>{language === 'es' ? 'Tratamiento:' : 'Treatment:'}</strong>
          <span>{raw.treatment}</span>
        </div>
      )}
      {raw.weight_kg && (
        <div className="vet-history-event-row">
          <strong>{language === 'es' ? 'Peso:' : 'Weight:'}</strong>
          <span>{raw.weight_kg} kg</span>
        </div>
      )}
      {(raw.notes) && (
        <p className="vet-history-event-detail italic">{raw.notes}</p>
      )}
    </>
  );
}

function DiagnosisCard({ raw, language }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <p className="vet-history-event-title">{raw.diagnosis || '—'}</p>
      {raw.status && (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
          {raw.status}
        </span>
      )}
      {raw.reason && (
        <div className="vet-history-event-row mt-1">
          <strong>{language === 'es' ? 'Motivo:' : 'Reason:'}</strong>
          <span>{raw.reason}</span>
        </div>
      )}
      {raw.symptoms && (
        <div className="vet-history-event-row">
          <strong>{language === 'es' ? 'Síntomas:' : 'Symptoms:'}</strong>
          <span>{raw.symptoms}</span>
        </div>
      )}
      {(raw.clinical_plan || raw.treatment || raw.owner_instructions || raw.follow_up) && (
        <button
          type="button"
          className="mt-2 flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          {expanded
            ? (language === 'es' ? 'Ver menos' : 'Show less')
            : (language === 'es' ? 'Ver más' : 'Show more')}
          {expanded ? <HiChevronUp /> : <HiChevronDown />}
        </button>
      )}
      {expanded && (
        <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
          {raw.treatment && (
            <div className="vet-history-event-row">
              <strong>{language === 'es' ? 'Tratamiento:' : 'Treatment:'}</strong>
              <span>{raw.treatment}</span>
            </div>
          )}
          {raw.clinical_plan && (
            <div className="vet-history-event-row">
              <strong>{language === 'es' ? 'Plan clínico:' : 'Clinical plan:'}</strong>
              <span>{raw.clinical_plan}</span>
            </div>
          )}
          {raw.owner_instructions && (
            <div className="vet-history-event-row">
              <strong>{language === 'es' ? 'Indicaciones:' : 'Instructions:'}</strong>
              <span>{raw.owner_instructions}</span>
            </div>
          )}
          {raw.follow_up && (
            <div className="vet-history-event-row">
              <strong>{language === 'es' ? 'Seguimiento:' : 'Follow-up:'}</strong>
              <span>{raw.follow_up}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function MedicationCard({ raw, language }) {
  const statusClass = raw.status === 'active' ? 'vet-med-status--active' : 'vet-med-status--completed';
  const statusLabel = raw.status === 'active'
    ? (language === 'es' ? 'Activo' : 'Active')
    : (language === 'es' ? 'Completado' : 'Completed');
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <p className="vet-history-event-title mb-0">{raw.name}</p>
        <span className={`vet-med-status ${statusClass}`}>{statusLabel}</span>
      </div>
      <p className="vet-history-event-subtitle">{raw.dosage} · {raw.frequency}</p>
      <div className="vet-history-event-row mt-1">
        <strong>{language === 'es' ? 'Período:' : 'Period:'}</strong>
        <span>{formatDate(raw.start_date, language)} — {formatDate(raw.end_date, language)}</span>
      </div>
      {raw.notes && (
        <p className="vet-history-event-detail italic">{raw.notes}</p>
      )}
    </>
  );
}

function VaccineCard({ raw, language }) {
  const statusClass = raw.status === 'completed'
    ? 'vet-vaccine-status--completed'
    : 'vet-vaccine-status--upcoming';
  const statusLabel = raw.status === 'completed'
    ? (language === 'es' ? 'Aplicada' : 'Applied')
    : (language === 'es' ? 'Programada' : 'Upcoming');
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <p className="vet-history-event-title mb-0">{raw.name}</p>
        <span className={`vet-med-status ${statusClass}`}>{statusLabel}</span>
      </div>
      <p className="vet-history-event-subtitle">{raw.brand} {raw.dose && `· ${raw.dose} ${raw.unit ?? ''}`}</p>
      {raw.administration_route && (
        <div className="vet-history-event-row">
          <strong>{language === 'es' ? 'Vía:' : 'Route:'}</strong>
          <span>{raw.administration_route}</span>
        </div>
      )}
      {raw.next_dose && (
        <div className="vet-history-event-row">
          <strong>{language === 'es' ? 'Próxima dosis:' : 'Next dose:'}</strong>
          <span>{formatDate(raw.next_dose, language)}</span>
        </div>
      )}
      {raw.notes && (
        <p className="vet-history-event-detail italic">{raw.notes}</p>
      )}
    </>
  );
}

function LabCard({ raw, language }) {
  return (
    <>
      <p className="vet-history-event-title">{raw.test_type || '—'}</p>
      {raw.result_summary && (
        <div className="vet-history-event-row">
          <strong>{language === 'es' ? 'Resultado:' : 'Result:'}</strong>
          <span>{raw.result_summary}</span>
        </div>
      )}
      {raw.clinical_observations && (
        <p className="vet-history-event-detail">{raw.clinical_observations}</p>
      )}
    </>
  );
}

function EventCardContent({ event, language }) {
  const { type, raw } = event;
  switch (type) {
    case TIMELINE_TYPES.CONSULTATION: return <ConsultationCard raw={raw} language={language} />;
    case TIMELINE_TYPES.DIAGNOSIS:    return <DiagnosisCard raw={raw} language={language} />;
    case TIMELINE_TYPES.MEDICATION:   return <MedicationCard raw={raw} language={language} />;
    case TIMELINE_TYPES.VACCINE:      return <VaccineCard raw={raw} language={language} />;
    case TIMELINE_TYPES.LAB:          return <LabCard raw={raw} language={language} />;
    default:                          return null;
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function VetMedicalHistory() {
  const { appointmentId } = useParams();
  const { language } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: appointments = [], isLoading: apptLoading } = useAppointments({ enabled: true });
  const appointment = appointments.find((a) => a.id === appointmentId);
  const petId = appointment?.pet_id;

  const { timeline, allergies, isLoading: historyLoading, isError } = useMedicalHistory(petId);

  const isLoading = apptLoading || historyLoading;

  const filteredEvents = activeFilter === 'all'
    ? timeline
    : timeline.filter((e) => e.type === activeFilter);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="vet-history-page">
        <Loader label={language === 'es' ? 'Cargando historial médico…' : 'Loading medical history…'} />
      </div>
    );
  }

  // ── Error / not found ──
  if (isError || !appointment) {
    return (
      <div className="vet-history-page">
        <Link
          to={ROUTES.VET.PATIENT.replace(':appointmentId', appointmentId)}
          className="vet-history-back"
        >
          <HiArrowLeft aria-hidden="true" />
          {language === 'es' ? 'Volver al paciente' : 'Back to patient'}
        </Link>
        <p className="status-error mt-6">
          {language === 'es'
            ? 'No se pudo cargar el historial médico.'
            : 'Could not load the medical history.'}
        </p>
      </div>
    );
  }

  const { pet_name, pet_species, pet_sex, pet_breed, pet_birth_date, pet_weight_kg, owner_name, pet_photo_url } = appointment;

  return (
    <main className="vet-history-page">

      {/* ── Back link ── */}
      <Link
        to={ROUTES.VET.PATIENT.replace(':appointmentId', appointmentId)}
        className="vet-history-back"
      >
        <HiArrowLeft aria-hidden="true" />
        {language === 'es' ? 'Volver al paciente' : 'Back to patient'}
      </Link>

      {/* ── Hero ── */}
      <section className="vet-history-hero">
        <div className="vet-history-hero-avatar">
          {pet_photo_url ? (
            <img src={pet_photo_url} alt={pet_name} />
          ) : (
            <span aria-hidden="true">{SPECIES_ICON[pet_species] ?? DEFAULT_PET_ICON}</span>
          )}
        </div>

        <div className="vet-history-hero-info">
          <h1 className="vet-history-hero-name">{pet_name}</h1>
          <dl className="vet-history-hero-meta">
            {pet_species && (
              <div><strong>{language === 'es' ? 'Especie' : 'Species'}:</strong> {pet_species}</div>
            )}
            {pet_breed && (
              <div><strong>{language === 'es' ? 'Raza' : 'Breed'}:</strong> {pet_breed}</div>
            )}
            {pet_sex && (
              <div><strong>{language === 'es' ? 'Sexo' : 'Sex'}:</strong> {pet_sex}</div>
            )}
            {pet_birth_date && (
              <div><strong>{language === 'es' ? 'Edad' : 'Age'}:</strong> {calculateAge(pet_birth_date)}</div>
            )}
            {pet_weight_kg && (
              <div><strong>{language === 'es' ? 'Peso' : 'Weight'}:</strong> {pet_weight_kg} kg</div>
            )}
            {owner_name && (
              <div>
                <HiUserCircle className="inline mr-1" aria-hidden="true" />
                <strong>{language === 'es' ? 'Dueño' : 'Owner'}:</strong> {owner_name}
              </div>
            )}
          </dl>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
            {language === 'es' ? 'Total de eventos' : 'Total events'}
          </p>
          <p className="text-3xl font-extrabold text-teal-600">{timeline.length}</p>
        </div>
      </section>

      {/* ── Allergy panel ── */}
      <section className="vet-allergy-panel" aria-label={language === 'es' ? 'Alergias' : 'Allergies'}>
        <h2 className="vet-allergy-panel-title">
          <HiExclamation aria-hidden="true" />
          {language === 'es' ? 'Alergias registradas' : 'Registered Allergies'}
          <span className="ml-1 text-xs font-normal text-amber-600">
            ({allergies.length})
          </span>
        </h2>

        {allergies.length === 0 ? (
          <p className="vet-allergy-empty">
            {language === 'es' ? 'Sin alergias registradas.' : 'No allergies on record.'}
          </p>
        ) : (
          <div className="vet-allergy-badges" role="list">
            {allergies.map((allergy) => (
              <span
                key={allergy.id}
                role="listitem"
                title={allergy.reaction ?? ''}
                className={`vet-allergy-badge ${severityClass(allergy.severity)}`}
              >
                {allergy.allergen}
                <span className="opacity-70">·</span>
                {severityLabel(allergy.severity, language)}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Filter chips ── */}
      <div className="vet-history-filters" role="group" aria-label={language === 'es' ? 'Filtrar por tipo' : 'Filter by type'}>
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            id={`filter-${filter.key}`}
            onClick={() => setActiveFilter(filter.key)}
            aria-pressed={activeFilter === filter.key}
            className={`vet-history-filter ${activeFilter === filter.key ? 'vet-history-filter--active' : ''}`}
          >
            {filter.icon}
            {filter.label[language] ?? filter.label.en}
            {filter.key !== 'all' && (
              <span className="ml-0.5 opacity-60 text-xs">
                ({timeline.filter((e) => e.type === filter.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Timeline ── */}
      <section aria-label={language === 'es' ? 'Línea de tiempo' : 'Timeline'}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {language === 'es' ? 'Historial Médico' : 'Medical History'}
        </h2>

        {filteredEvents.length === 0 ? (
          <div className="vet-history-empty">
            <div className="vet-history-empty-icon">📋</div>
            <p className="vet-history-empty-text">
              {language === 'es'
                ? 'No hay registros para este filtro.'
                : 'No records for this filter.'}
            </p>
          </div>
        ) : (
          <ol className="vet-history-timeline" aria-label={language === 'es' ? 'Eventos del historial' : 'History events'}>
            {filteredEvents.map((event) => {
              const meta = TYPE_META[event.type];
              return (
                <li key={event.id} className="vet-history-event">

                  {/* Dot */}
                  <div
                    className={`vet-history-event-dot vet-history-event-dot--${event.type}`}
                    aria-hidden="true"
                  >
                    {meta.dot}
                  </div>

                  {/* Card */}
                  <div className={`vet-history-event-card vet-history-event-card--${event.type}`}>
                    <div className="vet-history-event-header">
                      <span className={`vet-history-event-type-badge vet-history-event-type-badge--${event.type}`}>
                        {meta.label[language] ?? meta.label.en}
                      </span>
                      <time
                        className="vet-history-event-date"
                        dateTime={event.date}
                      >
                        {formatDate(event.date, language)}
                      </time>
                    </div>

                    <EventCardContent event={event} language={language} />

                    {/* Vet attribution */}
                    {event.raw.veterinarian_name && (
                      <p className="vet-history-vet-name">
                        <HiUserCircle aria-hidden="true" />
                        {event.raw.veterinarian_name}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
