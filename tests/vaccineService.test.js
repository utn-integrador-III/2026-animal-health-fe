import { beforeEach, describe, expect, test, vi } from 'vitest';
import { addVaccine, getVaccines } from '../src/services/vaccineService';

// Mock the api module (Axios instance) so no real HTTP calls are made
vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '../src/services/api';

const PET_ID = 'pet-1';

const MOCK_VACCINE = {
  id: 'vac-1',
  pet_id: PET_ID,
  name: 'Rabia',
  type: 'Rabia (Lyssavirus)',
  brand: 'Merial',
  batch_number: 'LOTE-001',
  scheduled_date: '2026-07-10',
  expiration_date: null,
  next_dose: null,
  administration_route: 'Subcutánea',
  dose: '1',
  unit: 'dosis',
  raw_status: 'Aplicada correctamente',
  status: 'completed',
  notes: 'Sin reacciones adversas',
  veterinarian_id: 'vet-1',
  veterinarian_name: 'Dr. Smith',
  created_at: '2026-07-10T12:00:00+00:00',
};

describe('vaccineService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getVaccines', () => {
    test('calls GET /api/pets/{petId}/vaccines and returns data', async () => {
      api.get.mockResolvedValueOnce({ data: [MOCK_VACCINE] });

      const result = await getVaccines(PET_ID);

      expect(api.get).toHaveBeenCalledWith(`/api/pets/${PET_ID}/vaccines`);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Rabia');
      expect(result[0].status).toBe('completed');
    });

    test('returns an empty array when no vaccines exist', async () => {
      api.get.mockResolvedValueOnce({ data: [] });

      const result = await getVaccines(PET_ID);

      expect(result).toEqual([]);
    });
  });

  describe('addVaccine', () => {
    test('calls POST /api/pets/{petId}/vaccines and returns the created record', async () => {
      api.post.mockResolvedValueOnce({ data: MOCK_VACCINE });

      const payload = {
        name: 'Rabia',
        type: 'Rabia (Lyssavirus)',
        brand: 'Merial',
        scheduled_date: '2026-07-10',
        raw_status: 'Aplicada correctamente',
      };

      const result = await addVaccine(PET_ID, payload);

      expect(api.post).toHaveBeenCalledWith(
        `/api/pets/${PET_ID}/vaccines`,
        payload,
      );
      expect(result.id).toBe('vac-1');
      expect(result.pet_id).toBe(PET_ID);
    });
  });
});
