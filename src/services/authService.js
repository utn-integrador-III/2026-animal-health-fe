import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const registerUser = async (userData) => {
  const response = await api.post(API_ROUTES.AUTH.REGISTER, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post(API_ROUTES.AUTH.LOGIN, credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get(API_ROUTES.AUTH.PROFILE);
  return response.data;
};
