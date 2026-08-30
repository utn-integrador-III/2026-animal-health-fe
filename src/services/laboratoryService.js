import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

/**
 * Fetches all laboratory results and requests for a pet.
 * @param {string} petId
 * @returns {Promise<Array>} List of lab results/requests
 */
export async function getLabResults(petId) {
  if (!petId) return [];
  const response = await api.get(API_ROUTES.LAB_RESULTS.BY_PET(petId));
  if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

/**
 * Fetches a single laboratory result by its ID.
 * @param {string} resultId
 * @returns {Promise<Object>}
 */
export async function getLabResultById(resultId) {
  const response = await api.get(API_ROUTES.LAB_RESULTS.BY_ID(resultId));
  return response.data;
}

/**
 * Creates a new laboratory exam request for a pet.
 * @param {string} petId
 * @param {Object} requestData
 * @returns {Promise<Object>}
 */
export async function createLabRequest(petId, requestData) {
  const response = await api.post(API_ROUTES.LAB_RESULTS.BY_PET(petId), requestData);
  return response.data;
}

/**
 * Uploads a PDF or image report for a laboratory result.
 * @param {string} resultId
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function uploadLabResultFile(resultId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(API_ROUTES.LAB_RESULTS.UPLOAD(resultId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Updates a laboratory result (uploading results, observations, recommendations, status).
 * @param {string} resultId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export async function updateLabResult(resultId, updateData) {
  const response = await api.put(API_ROUTES.LAB_RESULTS.BY_ID(resultId), updateData);
  return response.data;
}

/**
 * Deletes a laboratory result.
 * @param {string} resultId
 * @returns {Promise<Object>}
 */
export async function deleteLabResult(resultId) {
  const response = await api.delete(API_ROUTES.LAB_RESULTS.BY_ID(resultId));
  return response.data;
}
