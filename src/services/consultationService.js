import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export async function findClientByEmail(email) {
  const response = await api.get(API_ROUTES.CONSULTATIONS.CLIENTS, {
    params: { email },
  });
  return response.data;
}

export async function createWalkInConsultation(consultationData) {
  const response = await api.post(API_ROUTES.CONSULTATIONS.WALK_IN, consultationData);
  return response.data;
}

export async function createDiagnosis(consultationId, diagnosisData) {
  const response = await api.post(
    API_ROUTES.CONSULTATIONS.DIAGNOSES(consultationId),
    diagnosisData,
  );
  return response.data;
}
