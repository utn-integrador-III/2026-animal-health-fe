/**
 * allergyService.js
 *
 * Connects the frontend to the backend allergy API.
 * Endpoints:
 *   GET    /api/pets/{petId}/allergies              — list allergies for a pet
 *   POST   /api/pets/{petId}/allergies              — create a new allergy (client or vet)
 *   GET    /api/pets/{petId}/allergies/{id}         — get a specific allergy
 *   PUT    /api/pets/{petId}/allergies/{id}         — update an allergy (vet only)
 *   DELETE /api/pets/{petId}/allergies/{id}         — delete an allergy (vet only)
 */

import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

/**
 * Fetches the full list of allergies for a given pet.
 * @param {string} petId
 * @returns {Promise<Array>}
 */
export async function getAllergies(petId) {
  const response = await api.get(API_ROUTES.PETS.ALLERGIES.BY_PET(petId));
  return response.data;
}

/**
 * Creates a new allergy record for a pet.
 * @param {string} petId
 * @param {object} allergyData - { allergen, category, severity, reaction?, notes? }
 * @returns {Promise<object>} The created AllergyResponse
 */
export async function addAllergy(petId, allergyData) {
  const response = await api.post(API_ROUTES.PETS.ALLERGIES.BY_PET(petId), allergyData);
  return response.data;
}

/**
 * Updates an existing allergy record (veterinarian only).
 * @param {string} petId
 * @param {string} allergyId
 * @param {object} allergyData - partial update fields
 * @returns {Promise<object>} The updated AllergyResponse
 */
export async function updateAllergy(petId, allergyId, allergyData) {
  const response = await api.put(API_ROUTES.PETS.ALLERGIES.SPECIFIC(petId, allergyId), allergyData);
  return response.data;
}

/**
 * Deletes an allergy record (veterinarian only).
 * @param {string} petId
 * @param {string} allergyId
 * @returns {Promise<void>}
 */
export async function deleteAllergy(petId, allergyId) {
  await api.delete(API_ROUTES.PETS.ALLERGIES.SPECIFIC(petId, allergyId));
}
