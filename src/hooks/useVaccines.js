import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addVaccine, getVaccines } from '../services/vaccineService';

/**
 * React Query hooks for the vaccine history API.
 *
 * - useVaccinesList(petId)  — fetches GET /api/pets/{petId}/vaccines
 * - useAddVaccine()         — mutates POST /api/pets/{petId}/vaccines
 */

export function useVaccinesList(petId) {
  return useQuery({
    queryKey: ['vaccines', petId],
    queryFn: () => getVaccines(petId),
    enabled: Boolean(petId),
  });
}

export function useAddVaccine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, vaccineData }) => addVaccine(petId, vaccineData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vaccines', variables.petId] });
    },
  });
}
