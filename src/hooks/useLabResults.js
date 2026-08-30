import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLabResults,
  getLabResultById,
  createLabRequest,
  uploadLabResultFile,
  updateLabResult,
  deleteLabResult,
} from '../services/laboratoryService';

/**
 * React Query hooks for the Laboratory API.
 *
 * - useLabResultsList(petId)         — GET /api/lab-results/pet/{petId}
 * - useLabResult(resultId)           — GET /api/lab-results/{resultId}
 * - useCreateLabRequest()            — POST /api/lab-results/pet/{petId}
 * - useUploadLabResultFile()         — POST /api/lab-results/{resultId}/upload
 * - useUpdateLabResult()             — PUT /api/lab-results/{resultId}
 * - useDeleteLabResult()             — DELETE /api/lab-results/{resultId}
 */

export function useLabResultsList(petId) {
  return useQuery({
    queryKey: ['lab-results', petId],
    queryFn: () => getLabResults(petId),
    enabled: Boolean(petId),
  });
}

export function useLabResult(resultId) {
  return useQuery({
    queryKey: ['lab-result', resultId],
    queryFn: () => getLabResultById(resultId),
    enabled: Boolean(resultId),
  });
}

export function useCreateLabRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, requestData }) => createLabRequest(petId, requestData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lab-results', variables.petId] });
    },
  });
}

export function useUploadLabResultFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId, file }) => uploadLabResultFile(resultId, file),
    onSuccess: (data, variables) => {
      if (variables.petId) {
        queryClient.invalidateQueries({ queryKey: ['lab-results', variables.petId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['lab-results'] });
      }
      queryClient.invalidateQueries({ queryKey: ['lab-result', variables.resultId] });
    },
  });
}

export function useUpdateLabResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId, updateData }) => updateLabResult(resultId, updateData),
    onSuccess: (data, variables) => {
      if (variables.petId) {
        queryClient.invalidateQueries({ queryKey: ['lab-results', variables.petId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['lab-results'] });
      }
      queryClient.invalidateQueries({ queryKey: ['lab-result', variables.resultId] });
    },
  });
}

export function useDeleteLabResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId }) => deleteLabResult(resultId),
    onSuccess: (_data, variables) => {
      if (variables.petId) {
        queryClient.invalidateQueries({ queryKey: ['lab-results', variables.petId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['lab-results'] });
      }
    },
  });
}
