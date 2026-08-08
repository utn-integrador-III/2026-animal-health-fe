import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getClinicalRecords,
  addClinicalRecord,
  getMedications,
  addMedication,
  toggleMedicationCheck,
} from '../services/medicalService';

export function useClinicalRecordsList(petId) {
  return useQuery({
    queryKey: ['clinical-records', petId],
    queryFn: () => getClinicalRecords(petId),
    enabled: Boolean(petId),
  });
}

export function useAddClinicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, recordData }) => addClinicalRecord(petId, recordData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinical-records', variables.petId] });
    },
  });
}

export function useMedicationsList(petId) {
  return useQuery({
    queryKey: ['medications', petId],
    queryFn: () => getMedications(petId),
    enabled: Boolean(petId),
  });
}

export function useAddMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, medicationData }) => addMedication(petId, medicationData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.petId] });
    },
  });
}

export function useToggleMedicationCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, medicationId, date }) => toggleMedicationCheck({ petId, medicationId, date }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.petId] });
    },
  });
}
