import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

/**
 * Fetches the medical/clinical records for a pet.
 */
export async function getClinicalRecords(petId) {
  const response = await api.get(API_ROUTES.PETS.CLINICAL_RECORDS(petId));
  return response.data;
}

/**
 * Creates a new clinical record for a pet.
 */
export async function addClinicalRecord(petId, recordData) {
  const response = await api.post(API_ROUTES.PETS.CLINICAL_RECORDS(petId), recordData);
  return response.data;
}

/**
 * Fetches the medications list for a pet.
 */
export async function getMedications(petId) {
  const response = await api.get(API_ROUTES.PETS.MEDICATIONS(petId));
  return response.data;
}

/**
 * Prescribes a new medication treatment.
 */
export async function addMedication(petId, medicationData) {
  const response = await api.post(API_ROUTES.PETS.MEDICATIONS(petId), medicationData);
  return response.data;
}

/**
 * Toggles a date check on an active medication checklist.
 */
export async function toggleMedicationCheck({ petId, medicationId, date }) {
  const response = await api.post(API_ROUTES.PETS.MEDICATIONS_TOGGLE(petId, medicationId), { date });
  return response.data;
}
