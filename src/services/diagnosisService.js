/**
 * diagnosisService.js
 *
 * Connects the frontend to the backend diagnosis API.
 * Endpoints:
 *   GET    /api/pets/{petId}/diagnoses         — list diagnoses for a pet
 *   POST   /api/pets/{petId}/diagnoses         — create a new diagnosis record (vet)
 *   GET    /api/pets/{petId}/diagnoses/{id}    — get a specific diagnosis
 */

import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

/**
 * Fetches all diagnoses for a given pet.
 * @param {string} petId
 * @returns {Promise<Array>}
 */
export async function getDiagnoses(petId) {
  const response = await api.get(API_ROUTES.PETS.DIAGNOSES.BY_PET(petId));
  return response.data;
}

/**
 * Creates a new diagnosis record for a pet.
 * @param {string} petId
 * @param {object} diagnosisData
 * @returns {Promise<object>} The created DiagnosisResponse
 */
export async function addDiagnosis(petId, diagnosisData) {
  const response = await api.post(API_ROUTES.PETS.DIAGNOSES.BY_PET(petId), diagnosisData);
  return response.data;
}

/**
 * Retrieves a specific diagnosis record.
 * @param {string} petId
 * @param {string} diagnosisId
 * @returns {Promise<object>}
 */
export async function getDiagnosis(petId, diagnosisId) {
  const response = await api.get(API_ROUTES.PETS.DIAGNOSES.SPECIFIC(petId, diagnosisId));
  return response.data;
}
