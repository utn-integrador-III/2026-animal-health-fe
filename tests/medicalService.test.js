// tests/medicalService.test.js
// Unit tests for getMedications, addMedication, and toggleMedicationCheck

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  getMedications,
  addMedication,
  toggleMedicationCheck,
} from '../src/services/medicalService';

// Mock the axios api instance so no real HTTP calls are made
vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '../src/services/api';

const PET_ID = 'pet-abc123';

const MOCK_MEDICATION = {
  id: 'med-1',
  pet_id: PET_ID,
  name: 'Desparasitante',
  dosage: '1.5 tabletas',
  frequency: 'Diaria',
  administration_time: '13:45',
  start_date: '2026-07-01',
  end_date: '2026-07-31',
  status: 'active',
  checked_dates: [],
  veterinarian_name: 'Dra. García',
  notes: 'Administrar con comida',
};

describe('medicalService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getMedications', () => {
    test('calls GET /api/pets/{petId}/medications and returns data', async () => {
      api.get.mockResolvedValueOnce({ data: [MOCK_MEDICATION] });

      const result = await getMedications(PET_ID);

      expect(api.get).toHaveBeenCalledWith(`/api/pets/${PET_ID}/medications`);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Desparasitante');
      expect(result[0].status).toBe('active');
    });

    test('returns an empty array when no medications exist', async () => {
      api.get.mockResolvedValueOnce({ data: [] });

      const result = await getMedications(PET_ID);

      expect(result).toEqual([]);
    });

    test('propagates errors from the API', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getMedications(PET_ID)).rejects.toThrow('Network error');
    });
  });

  describe('addMedication', () => {
    test('calls POST /api/pets/{petId}/medications and returns the created record', async () => {
      api.post.mockResolvedValueOnce({ data: MOCK_MEDICATION });

      const payload = {
        name: 'Desparasitante',
        dosage: '1.5 tabletas',
        frequency: 'Diaria',
        administration_time: '13:45',
        start_date: '2026-07-01',
        end_date: '2026-07-31',
      };

      const result = await addMedication(PET_ID, payload);

      expect(api.post).toHaveBeenCalledWith(`/api/pets/${PET_ID}/medications`, payload);
      expect(result.id).toBe('med-1');
      expect(result.pet_id).toBe(PET_ID);
    });
  });

  describe('toggleMedicationCheck', () => {
    test('calls POST .../toggle-check with the date and returns data', async () => {
      const MED_ID = 'med-1';
      const today = '2026-07-31';
      api.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await toggleMedicationCheck({ petId: PET_ID, medicationId: MED_ID, date: today });

      expect(api.post).toHaveBeenCalledWith(
        `/api/pets/${PET_ID}/medications/${MED_ID}/toggle-check`,
        { date: today }
      );
      expect(result.success).toBe(true);
    });
  });
});
