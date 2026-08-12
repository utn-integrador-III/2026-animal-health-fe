import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createDiagnosis,
  createWalkInConsultation,
  findClientByEmail,
} from '../services/consultationService';

export function useFindClientByEmail() {
  return useMutation({
    mutationFn: findClientByEmail,
  });
}

export function useCreateWalkInConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWalkInConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCreateDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ consultationId, diagnosisData }) => createDiagnosis(consultationId, diagnosisData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinical-records', variables.diagnosisData.pet_id] });
    },
  });
}
