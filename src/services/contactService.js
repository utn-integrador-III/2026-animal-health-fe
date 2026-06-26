import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const sendContactMessage = async (message) => {
  const response = await api.post(API_ROUTES.CONTACT, message);
  return response.data;
};
