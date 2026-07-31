import { API_ROUTES } from '../constants/apiRoutes';
import api from './api';

export async function sendContactMessage(contactData) {
  const response = await api.post(API_ROUTES.CONTACT.BASE, contactData);
  return response.data;
}
