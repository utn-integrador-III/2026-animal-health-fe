import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createPet, getPet, getPets, updatePet, deletePet } from '../services/petService';

const PETS_KEY = ['pets'];

export function usePetsList() {
  return useQuery({
    queryKey: PETS_KEY,
    queryFn: getPets,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PETS_KEY });
    },
  });
}

export function usePet(petId) {
  return useQuery({
    queryKey: ['pets', petId],
    queryFn: () => getPet(petId),
    enabled: Boolean(petId),
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}