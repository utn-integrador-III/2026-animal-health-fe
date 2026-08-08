import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelAppointment,
  completeAppointment,
  createAppointment,
  createFollowUpAppointment,
  getAppointments,
  getAvailableSlots,
  getVeterinarians,
  updateAppointment,
} from '../services/appointmentService';

const APPOINTMENTS_KEY = ['appointments'];

export function useAppointments({ petId, appointmentDate, enabled = Boolean(petId || appointmentDate) } = {}) {
  return useQuery({
    queryKey: [...APPOINTMENTS_KEY, { petId, appointmentDate }],
    queryFn: () => getAppointments({ petId, appointmentDate }),
    enabled,
  });
}

export function useVeterinarians() {
  return useQuery({
    queryKey: ['veterinarians'],
    queryFn: getVeterinarians,
  });
}

export function useAvailableSlots({ appointmentDate, veterinarianId, durationBlocks = 1 }) {
  return useQuery({
    queryKey: ['available-slots', appointmentDate, veterinarianId, durationBlocks],
    queryFn: () => getAvailableSlots({ appointmentDate, veterinarianId, durationBlocks }),
    enabled: Boolean(appointmentDate && veterinarianId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

export function useCreateFollowUpAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFollowUpAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelAppointment,
    onMutate: async (appointmentId) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_KEY });
      const snapshots = queryClient.getQueriesData({ queryKey: APPOINTMENTS_KEY });

      snapshots.forEach(([queryKey, data]) => {
        if (!Array.isArray(data)) return;
        queryClient.setQueryData(
          queryKey,
          data.map((appointment) => (
            appointment.id === appointmentId
              ? { ...appointment, status: 'cancelled' }
              : appointment
          )),
        );
      });

      return { snapshots };
    },
    onError: (_error, _appointmentId, context) => {
      context?.snapshots?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}
