import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const createPet = async (petData) => {
  const response = await api.post(API_ROUTES.PETS.BASE, petData);
  return response.data;
};

export const getPets = async () => {
  const response = await api.get(API_ROUTES.PETS.BASE);
  return response.data;
};

export const getPet = async (petId) => {
  const response = await api.get(`${API_ROUTES.PETS.BASE}/${petId}`);
  return response.data;
};

export const updatePet = async ({ petId, petData }) => {
  const response = await api.put(`${API_ROUTES.PETS.BASE}/${petId}`, petData);
  return response.data;
};

export const uploadPetPhoto = async ({ petId, photo }) => {
  const formData = new FormData();
  formData.append('photo', photo);

  const response = await api.post(`${API_ROUTES.PETS.BASE}/${petId}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePet = async (petId) => {
  await api.delete(`${API_ROUTES.PETS.BASE}/${petId}`);
};
