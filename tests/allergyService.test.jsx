import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getAllergies, addAllergy, updateAllergy, deleteAllergy } from '../src/services/allergyService';

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
const ALLERGY_ID = 'allergy-456';

const MOCK_ALLERGY = {
  id: ALLERGY_ID,
  pet_id: PET_ID,
  allergen: 'Penicilina',
  category: 'medication',
  severity: 'severe',
  reaction: 'Shock anafiláctico',
  notes: 'No administrar bajo ninguna circunstancia',
  created_at: '2026-07-31T10:00:00Z',
  veterinarian_name: 'Dr. House',
};

describe('allergyService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllergies', () => {
    test('calls GET /api/pets/{petId}/allergies and returns allergy list', async () => {
      api.get.mockResolvedValueOnce({ data: [MOCK_ALLERGY] });

      const result = await getAllergies(PET_ID);

      expect(api.get).toHaveBeenCalledWith(`/api/pets/${PET_ID}/allergies`);
      expect(result).toHaveLength(1);
      expect(result[0].allergen).toBe('Penicilina');
      expect(result[0].severity).toBe('severe');
    });

    test('returns empty array when pet has no registered allergies', async () => {
      api.get.mockResolvedValueOnce({ data: [] });

      const result = await getAllergies(PET_ID);

      expect(result).toEqual([]);
    });
  });

  describe('addAllergy', () => {
    test('calls POST /api/pets/{petId}/allergies with payload and returns created record', async () => {
      api.post.mockResolvedValueOnce({ data: MOCK_ALLERGY });

      const allergyData = {
        allergen: 'Penicilina',
        category: 'medication',
        severity: 'severe',
        reaction: 'Shock anafiláctico',
        notes: 'No administrar bajo ninguna circunstancia',
      };

      const result = await addAllergy(PET_ID, allergyData);

      expect(api.post).toHaveBeenCalledWith(`/api/pets/${PET_ID}/allergies`, allergyData);
      expect(result.id).toBe(ALLERGY_ID);
      expect(result.allergen).toBe('Penicilina');
    });
  });

  describe('updateAllergy', () => {
    test('calls PUT /api/pets/{petId}/allergies/{id} and returns updated record', async () => {
      const updatedMock = { ...MOCK_ALLERGY, severity: 'moderate' };
      api.put.mockResolvedValueOnce({ data: updatedMock });

      const updateData = { severity: 'moderate' };
      const result = await updateAllergy(PET_ID, ALLERGY_ID, updateData);

      expect(api.put).toHaveBeenCalledWith(`/api/pets/${PET_ID}/allergies/${ALLERGY_ID}`, updateData);
      expect(result.severity).toBe('moderate');
    });
  });

  describe('deleteAllergy', () => {
    test('calls DELETE /api/pets/{petId}/allergies/{id}', async () => {
      api.delete.mockResolvedValueOnce({ data: null });

      await deleteAllergy(PET_ID, ALLERGY_ID);

      expect(api.delete).toHaveBeenCalledWith(`/api/pets/${PET_ID}/allergies/${ALLERGY_ID}`);
    });
  });
});
