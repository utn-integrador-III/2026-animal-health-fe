/**
 * vaccineService.js
 *
 * Connects the frontend to the backend vaccine history API.
 * Endpoints:
 *   GET  /api/pets/{petId}/vaccines   — list vaccines for a pet
 *   POST /api/pets/{petId}/vaccines   — record a new vaccine (veterinarians only)
 */

import api from './api';

const vaccineUrl = (petId) => `/api/pets/${petId}/vaccines`;

/**
 * Fetches the full vaccination history for a given pet.
 * @param {string} petId
 * @returns {Promise<Array>}
 */
export async function getVaccines(petId) {
  const response = await api.get(vaccineUrl(petId));
  return response.data;
}

/**
 * Records a new vaccine applied by the authenticated veterinarian.
 *
 * The payload keys must match the VaccineCreate schema in the backend:
 *   name, type, brand, batch_number, scheduled_date, expiration_date,
 *   next_dose, administration_route, dose, unit, raw_status, notes
 *
 * @param {string} petId
 * @param {object} vaccineData
 * @returns {Promise<object>}  The created VaccineResponse
 */
export async function addVaccine(petId, vaccineData) {
  const response = await api.post(vaccineUrl(petId), vaccineData);
  return response.data;
}
