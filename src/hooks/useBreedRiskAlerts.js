import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getBreedRiskAlerts } from '../services/aiService';

const getCacheKey = (petId, language) => `breed-risk-alerts:${petId}:${language}`;

async function getCachedBreedRiskAlerts(petId, language) {
  const cacheKey = getCacheKey(petId, language);
  const cachedData = window.sessionStorage.getItem(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const data = await getBreedRiskAlerts(petId, language);
  window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}

export function useBreedRiskAlerts(petId, language = 'en') {
  const queryClient = useQueryClient();
  const queryKey = ['breed-risk-alerts', petId, language];
  const cacheKey = petId ? getCacheKey(petId, language) : null;

  const query = useQuery({
    queryKey,
    queryFn: () => getCachedBreedRiskAlerts(petId, language),
    enabled: Boolean(petId),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const refreshMutation = useMutation({
    mutationFn: () => getBreedRiskAlerts(petId, language, true),
    onSuccess: (data) => {
      if (cacheKey) {
        window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
      }
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    ...query,
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
    refreshError: refreshMutation.isError,
  };
}
