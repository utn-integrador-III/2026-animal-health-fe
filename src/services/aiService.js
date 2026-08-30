import { API_ROUTES } from '../constants/apiRoutes';
import api from './api';

export async function getBreedRiskAlerts(petId, language = 'en', refresh = false) {
  const response = await api.get(API_ROUTES.AI.BREED_RISK_ALERTS(petId), {
    params: { language, refresh },
  });
  return response.data;
}

export async function getPetCareRecommendations(petId, language = 'en', refresh = false) {
  const response = await api.get(API_ROUTES.AI.CARE_RECOMMENDATIONS(petId), {
    params: { language, refresh },
  });
  return response.data;
}
