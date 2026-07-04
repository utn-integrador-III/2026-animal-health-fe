import { describe, expect, test } from 'vitest';

import { petSchema } from '../src/validations/petSchema.js';

const validPet = {
  name: 'Luna',
  birth_date: '2024-01-01',
  species: 'Dog',
  sex: 'Female',
  breed_primary: 'Mixed',
  breed_secondary: '',
  mixed_breed: false,
  weight_kg: '8.5',
};

describe('petSchema', () => {
  test('accepts a valid domestic pet', () => {
    const result = petSchema.parse(validPet);
    expect(result.weight_kg).toBe(8.5);
  });

  test('requires positive weight', () => {
    expect(() => petSchema.parse({ ...validPet, weight_kg: '0' })).toThrow();
  });

  test('rejects unsupported species', () => {
    expect(() => petSchema.parse({ ...validPet, species: 'Snake' })).toThrow();
  });

  test('requires the second breed when mixed breed is selected', () => {
    expect(() => petSchema.parse({ ...validPet, mixed_breed: true })).toThrow();
  });

  test('rejects future dates', () => {
    expect(() => petSchema.parse({ ...validPet, birth_date: '2099-01-01' })).toThrow();
  });
});
