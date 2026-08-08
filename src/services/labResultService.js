/**
 * labResultService.js
 *
 * Connects the frontend to the lab results API via the pet endpoint.
 * Uses the access-controlled endpoint that validates vet assignment.
 * Endpoint:
 *   GET  /api/pets/{petId}/lab-results  — list lab results for a pet (client or assigned vet)
 */

import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

/**
 * Fetches all lab results for a given pet.
 * @param {string} petId
 * @returns {Promise<Array>}
 */
export async function getLabResults(petId) {
  const response = await api.get(API_ROUTES.PETS.LAB_RESULTS(petId));
  return response.data;
}
