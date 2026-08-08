import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const getAppointments = async ({ petId, appointmentDate } = {}) => {
  const response = await api.get(API_ROUTES.APPOINTMENTS.BASE, {
    params: {
      pet_id: petId || undefined,
      appointment_date: appointmentDate || undefined,
    },
  });
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post(API_ROUTES.APPOINTMENTS.BASE, appointmentData);
  return response.data;
};

export const createFollowUpAppointment = async (appointmentData) => {
  const response = await api.post(API_ROUTES.APPOINTMENTS.FOLLOW_UP, appointmentData);
  return response.data;
};

export const updateAppointment = async ({ appointmentId, appointmentData }) => {
  const response = await api.put(
    `${API_ROUTES.APPOINTMENTS.BASE}/${appointmentId}`,
    appointmentData,
  );
  return response.data;
};

export const cancelAppointment = async (appointmentId) => {
  const response = await api.post(`${API_ROUTES.APPOINTMENTS.BASE}/${appointmentId}/cancel`);
  return response.data;
};

export const completeAppointment = async ({ appointmentId, clinicalObservation }) => {
  const response = await api.post(`${API_ROUTES.APPOINTMENTS.BASE}/${appointmentId}/complete`, {
    clinical_observation: clinicalObservation,
  });
  return response.data;
};

export const getVeterinarians = async () => {
  const response = await api.get(API_ROUTES.APPOINTMENTS.VETERINARIANS);
  return response.data;
};

export const getAvailableSlots = async ({
  appointmentDate,
  veterinarianId,
  durationBlocks = 1,
}) => {
  const response = await api.get(API_ROUTES.APPOINTMENTS.AVAILABLE_SLOTS, {
    params: {
      appointment_date: appointmentDate,
      veterinarian_id: veterinarianId,
      duration_blocks: durationBlocks,
    },
  });
  return response.data;
};
