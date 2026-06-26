import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createPet, getPets } from '../services/petService';

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
