import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getDiagnoses, addDiagnosis } from '../services/diagnosisService';

/**
 * React Query hooks for the diagnosis API.
 *
 * - useDiagnosesList(petId)   — GET /api/pets/{petId}/diagnoses
 * - useAddDiagnosis()         — POST /api/pets/{petId}/diagnoses
 */

export function useDiagnosesList(petId) {
  return useQuery({
    queryKey: ['diagnoses', petId],
    queryFn: () => getDiagnoses(petId),
    enabled: Boolean(petId),
  });
}

export function useAddDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, diagnosisData }) => addDiagnosis(petId, diagnosisData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', variables.petId] });
    },
  });
}
