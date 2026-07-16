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

export const updateProfile = async (profileData) => {
  const response = await api.put(API_ROUTES.AUTH.PROFILE, profileData);
  return response.data;
};

export const uploadProfilePhoto = async (photo) => {
  const formData = new FormData();
  formData.append('photo', photo);
  const response = await api.post(API_ROUTES.AUTH.PROFILE_PHOTO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updatePassword = async (passwordData) => {
  await api.put(API_ROUTES.AUTH.PROFILE_PASSWORD, passwordData);
};
