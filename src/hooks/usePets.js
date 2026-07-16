import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPet,
  deletePet,
  getPet,
  getPets,
  updatePet,
  uploadPetPhoto,
} from '../services/petService';

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
    onSuccess: (updatedPet, variables) => {
      queryClient.setQueryData(['pets', variables.petId], updatedPet);
      queryClient.setQueryData(PETS_KEY, (currentPets) => (
        Array.isArray(currentPets)
          ? currentPets.map((pet) => (pet.id === variables.petId ? updatedPet : pet))
          : currentPets
      ));
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function useUploadPetPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPetPhoto,
    onSuccess: (updatedPet, variables) => {
      queryClient.setQueryData(['pets', variables.petId], updatedPet);
      queryClient.setQueryData(PETS_KEY, (currentPets) => (
        Array.isArray(currentPets)
          ? currentPets.map((pet) => (pet.id === variables.petId ? updatedPet : pet))
          : currentPets
      ));
      queryClient.invalidateQueries({ queryKey: PETS_KEY });
      queryClient.invalidateQueries({ queryKey: ['pets', variables.petId] });
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
