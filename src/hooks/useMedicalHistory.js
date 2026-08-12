import { useQueries } from '@tanstack/react-query';
import { getClinicalRecords } from '../services/medicalService';
import { getMedications } from '../services/medicalService';
import { getVaccines } from '../services/vaccineService';
import { getAllergies } from '../services/allergyService';
import { getDiagnoses } from '../services/diagnosisService';
import { getLabResults } from '../services/labResultService';

// ─── Timeline event types ────────────────────────────────────────────────────

export const TIMELINE_TYPES = {
  CONSULTATION: 'consultation',
  DIAGNOSIS: 'diagnosis',
  MEDICATION: 'medication',
  VACCINE: 'vaccine',
  LAB: 'lab',
};

/**
 * Extracts the best available ISO date string from a record.
 */
function extractDate(record, type) {
  switch (type) {
    case TIMELINE_TYPES.CONSULTATION:
      return record.date || record.created_at || '';
    case TIMELINE_TYPES.DIAGNOSIS:
      return record.consultation_date || record.created_at || '';
    case TIMELINE_TYPES.MEDICATION:
      return record.start_date || record.created_at || '';
    case TIMELINE_TYPES.VACCINE:
      return record.scheduled_date || record.created_at || '';
    case TIMELINE_TYPES.LAB:
      return record.test_date || record.created_at || '';
    default:
      return record.created_at || '';
  }
}

/**
 * Normalises a raw record from any source into a unified timeline event.
 */
function toTimelineEvent(record, type) {
  return {
    id: `${type}-${record.id}`,
    type,
    date: extractDate(record, type),
    raw: record,
  };
}

/**
 * useMedicalHistory(petId)
 *
 * Fires 6 parallel queries (React Query useQueries) and assembles them into:
 *   - timeline: sorted array of unified timeline events (desc by date)
 *   - allergies: array of allergy records
 *   - isLoading: true while any query is pending
 *   - isError: true if any query failed
 *   - refetchAll: function to invalidate all queries
 */
export function useMedicalHistory(petId) {
  const enabled = Boolean(petId);

  const results = useQueries({
    queries: [
      {
        queryKey: ['clinical-records', petId],
        queryFn: () => getClinicalRecords(petId),
        enabled,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['diagnoses', petId],
        queryFn: () => getDiagnoses(petId),
        enabled,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['medications', petId],
        queryFn: () => getMedications(petId),
        enabled,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['vaccines', petId],
        queryFn: () => getVaccines(petId),
        enabled,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['lab-results', petId],
        queryFn: () => getLabResults(petId),
        enabled,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['allergies', petId],
        queryFn: () => getAllergies(petId),
        enabled,
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const [
    clinicalResult,
    diagnosisResult,
    medicationsResult,
    vaccinesResult,
    labResult,
    allergiesResult,
  ] = results;

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const clinicalRecords = clinicalResult.data ?? [];
  const diagnoses = diagnosisResult.data ?? [];
  const medications = medicationsResult.data ?? [];
  const vaccines = vaccinesResult.data ?? [];
  const labResults = labResult.data ?? [];
  const allergies = allergiesResult.data ?? [];

  // Deduplicate diagnoses vs clinical records by id (both endpoints may return overlapping data)
  const diagnosisIds = new Set(diagnoses.map((d) => d.id));
  const uniqueClinical = clinicalRecords.filter((r) => !diagnosisIds.has(r.id));

  const events = [
    ...uniqueClinical.map((r) => toTimelineEvent(r, TIMELINE_TYPES.CONSULTATION)),
    ...diagnoses.map((r) => toTimelineEvent(r, TIMELINE_TYPES.DIAGNOSIS)),
    ...medications.map((r) => toTimelineEvent(r, TIMELINE_TYPES.MEDICATION)),
    ...vaccines.map((r) => toTimelineEvent(r, TIMELINE_TYPES.VACCINE)),
    ...labResults.map((r) => toTimelineEvent(r, TIMELINE_TYPES.LAB)),
  ];

  // Sort descending by date
  events.sort((a, b) => {
    const da = new Date(a.date || 0);
    const db_ = new Date(b.date || 0);
    return db_ - da;
  });

  return {
    timeline: events,
    allergies,
    isLoading,
    isError,
  };
}
