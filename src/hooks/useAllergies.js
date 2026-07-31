import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAllergies, addAllergy, updateAllergy, deleteAllergy } from '../services/allergyService';

/**
 * React Query hooks for the allergy API.
 *
 * - useAllergiesList(petId)   — GET /api/pets/{petId}/allergies
 * - useAddAllergy()           — POST /api/pets/{petId}/allergies
 * - useUpdateAllergy()        — PUT /api/pets/{petId}/allergies/{id}  (vet only)
 * - useDeleteAllergy()        — DELETE /api/pets/{petId}/allergies/{id} (vet only)
 */

export function useAllergiesList(petId) {
  return useQuery({
    queryKey: ['allergies', petId],
    queryFn: () => getAllergies(petId),
    enabled: Boolean(petId),
  });
}

export function useAddAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, allergyData }) => addAllergy(petId, allergyData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allergies', variables.petId] });
    },
  });
}

export function useUpdateAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, allergyId, allergyData }) => updateAllergy(petId, allergyId, allergyData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allergies', variables.petId] });
    },
  });
}

export function useDeleteAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, allergyId }) => deleteAllergy(petId, allergyId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allergies', variables.petId] });
    },
  });
}
