import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getDiagnoses, addDiagnosis, getDiagnosis } from '../src/services/diagnosisService';

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
const DIAGNOSIS_ID = 'diag-456';

const MOCK_DIAGNOSIS = {
  id: DIAGNOSIS_ID,
  pet_id: PET_ID,
  diagnosis: 'Dermatitis alérgica',
  presumptive_diagnosis: 'Dermatitis atópica',
  differential_diagnoses: 'Alergia alimentaria',
  status: 'Presuntivo',
  treatment: 'Antihistamínicos y champú medicado',
  notes: 'Rascado persistente',
  registered_by: 'veterinarian',
  veterinarian_name: 'Dr. Smith',
  created_at: '2026-08-01T10:00:00Z',
};

describe('diagnosisService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getDiagnoses', () => {
    test('calls GET /api/pets/{petId}/diagnoses and returns diagnoses list', async () => {
      api.get.mockResolvedValueOnce({ data: [MOCK_DIAGNOSIS] });

      const result = await getDiagnoses(PET_ID);

      expect(api.get).toHaveBeenCalledWith(`/api/pets/${PET_ID}/diagnoses`);
      expect(result).toHaveLength(1);
      expect(result[0].diagnosis).toBe('Dermatitis alérgica');
      expect(result[0].status).toBe('Presuntivo');
    });

    test('returns empty array when pet has no registered diagnoses', async () => {
      api.get.mockResolvedValueOnce({ data: [] });

      const result = await getDiagnoses(PET_ID);

      expect(result).toEqual([]);
    });
  });

  describe('addDiagnosis', () => {
    test('calls POST /api/pets/{petId}/diagnoses with payload and returns created record', async () => {
      api.post.mockResolvedValueOnce({ data: MOCK_DIAGNOSIS });

      const diagnosisData = {
        diagnosis: 'Dermatitis alérgica',
        status: 'Presuntivo',
        treatment: 'Antihistamínicos',
      };

      const result = await addDiagnosis(PET_ID, diagnosisData);

      expect(api.post).toHaveBeenCalledWith(`/api/pets/${PET_ID}/diagnoses`, diagnosisData);
      expect(result.id).toBe(DIAGNOSIS_ID);
      expect(result.diagnosis).toBe('Dermatitis alérgica');
    });
  });

  describe('getDiagnosis', () => {
    test('calls GET /api/pets/{petId}/diagnoses/{id}', async () => {
      api.get.mockResolvedValueOnce({ data: MOCK_DIAGNOSIS });

      const result = await getDiagnosis(PET_ID, DIAGNOSIS_ID);

      expect(api.get).toHaveBeenCalledWith(`/api/pets/${PET_ID}/diagnoses/${DIAGNOSIS_ID}`);
      expect(result.id).toBe(DIAGNOSIS_ID);
    });
  });
});
