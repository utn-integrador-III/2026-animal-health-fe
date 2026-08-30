import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  getLabResults,
  getLabResultById,
  createLabRequest,
  uploadLabResultFile,
  updateLabResult,
  deleteLabResult,
} from '../src/services/laboratoryService';

vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../src/services/api';

const PET_ID = 'pet-123';
const LAB_RESULT_ID = 'lab-456';

const MOCK_LAB_REQUEST = {
  id: LAB_RESULT_ID,
  pet_id: PET_ID,
  test_type: 'Hemograma',
  priority: 'Urgente',
  reason: 'Sospecha de anemia',
  clinical_observations: 'Mucosas pálidas',
  status: 'Solicitado',
  requested_at: '2026-08-27',
  created_at: '2026-08-27T10:00:00Z',
  veterinarian_name: 'Dra. María Sánchez',
};

const MOCK_LAB_RESULT_UPLOADED = {
  ...MOCK_LAB_REQUEST,
  status: 'Resultado disponible',
  result_date: '2026-08-28',
  file_url: 'https://storage.googleapis.com/test-bucket/lab_results/reporte.pdf',
  file_name: 'reporte.pdf',
  summary: 'Hematocrito 28%, leucocitos normales.',
  observations: 'Anemia normocítica leve.',
  recommendation: 'Suplemento de hierro por 15 días y control.',
};

describe('laboratoryService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getLabResults', () => {
    test('calls GET /api/lab-results/pet/{petId} and returns results array', async () => {
      api.get.mockResolvedValueOnce({ data: { results: [MOCK_LAB_REQUEST] } });

      const result = await getLabResults(PET_ID);

      expect(api.get).toHaveBeenCalledWith(`/api/lab-results/pet/${PET_ID}`);
      expect(result).toHaveLength(1);
      expect(result[0].test_type).toBe('Hemograma');
      expect(result[0].status).toBe('Solicitado');
    });

    test('handles array response directly', async () => {
      api.get.mockResolvedValueOnce({ data: [MOCK_LAB_REQUEST] });

      const result = await getLabResults(PET_ID);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(LAB_RESULT_ID);
    });

    test('returns empty array when pet has no lab results', async () => {
      api.get.mockResolvedValueOnce({ data: { results: [] } });

      const result = await getLabResults(PET_ID);

      expect(result).toEqual([]);
    });

    test('returns empty array when petId is not provided', async () => {
      const result = await getLabResults('');
      expect(result).toEqual([]);
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('getLabResultById', () => {
    test('calls GET /api/lab-results/{id}', async () => {
      api.get.mockResolvedValueOnce({ data: MOCK_LAB_REQUEST });

      const result = await getLabResultById(LAB_RESULT_ID);

      expect(api.get).toHaveBeenCalledWith(`/api/lab-results/${LAB_RESULT_ID}`);
      expect(result.id).toBe(LAB_RESULT_ID);
    });
  });

  describe('createLabRequest', () => {
    test('calls POST /api/lab-results/pet/{petId} with exam request payload', async () => {
      api.post.mockResolvedValueOnce({ data: MOCK_LAB_REQUEST });

      const payload = {
        test_type: 'Hemograma',
        priority: 'Urgente',
        reason: 'Sospecha de anemia',
        clinical_observations: 'Mucosas pálidas',
      };

      const result = await createLabRequest(PET_ID, payload);

      expect(api.post).toHaveBeenCalledWith(`/api/lab-results/pet/${PET_ID}`, payload);
      expect(result.id).toBe(LAB_RESULT_ID);
      expect(result.test_type).toBe('Hemograma');
    });
  });

  describe('uploadLabResultFile', () => {
    test('calls POST /api/lab-results/{id}/upload with FormData', async () => {
      api.post.mockResolvedValueOnce({ data: MOCK_LAB_RESULT_UPLOADED });

      const fakeFile = new File(['dummy pdf content'], 'reporte.pdf', { type: 'application/pdf' });
      const result = await uploadLabResultFile(LAB_RESULT_ID, fakeFile);

      expect(api.post).toHaveBeenCalledWith(
        `/api/lab-results/${LAB_RESULT_ID}/upload`,
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      expect(result.status).toBe('Resultado disponible');
      expect(result.file_url).toBe(MOCK_LAB_RESULT_UPLOADED.file_url);
    });
  });

  describe('updateLabResult', () => {
    test('calls PUT /api/lab-results/{id} with updated result details', async () => {
      api.put.mockResolvedValueOnce({ data: MOCK_LAB_RESULT_UPLOADED });

      const updateData = {
        summary: 'Hematocrito 28%',
        status: 'Resultado disponible',
      };

      const result = await updateLabResult(LAB_RESULT_ID, updateData);

      expect(api.put).toHaveBeenCalledWith(`/api/lab-results/${LAB_RESULT_ID}`, updateData);
      expect(result.summary).toBe(MOCK_LAB_RESULT_UPLOADED.summary);
    });
  });

  describe('deleteLabResult', () => {
    test('calls DELETE /api/lab-results/{id}', async () => {
      api.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });

      const result = await deleteLabResult(LAB_RESULT_ID);

      expect(api.delete).toHaveBeenCalledWith(`/api/lab-results/${LAB_RESULT_ID}`);
      expect(result.message).toBe('Deleted');
    });
  });
});
