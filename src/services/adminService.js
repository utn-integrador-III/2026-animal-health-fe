import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const getVeterinarians = async () => {
  const response = await api.get(API_ROUTES.ADMIN.VETERINARIANS);
  return response.data;
};

export const createVeterinarian = async (vetData) => {
  const response = await api.post(API_ROUTES.ADMIN.VETERINARIANS, vetData);
  return response.data;
};
