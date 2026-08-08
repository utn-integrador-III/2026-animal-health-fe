import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createVeterinarian, getVeterinarians } from '../services/adminService';

const VETERINARIANS_KEY = ['admin', 'veterinarians'];

export function useVeterinariansList() {
  return useQuery({
    queryKey: VETERINARIANS_KEY,
    queryFn: getVeterinarians,
  });
}

export function useCreateVeterinarian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVeterinarian,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VETERINARIANS_KEY });
    },
  });
}
