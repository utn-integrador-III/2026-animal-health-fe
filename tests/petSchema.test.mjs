import test from 'node:test';
import assert from 'node:assert/strict';

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

test('accepts a valid domestic pet', () => {
  const result = petSchema.parse(validPet);
  assert.equal(result.weight_kg, 8.5);
});

test('requires positive weight', () => {
  assert.throws(() => petSchema.parse({ ...validPet, weight_kg: '0' }));
});

test('rejects unsupported species', () => {
  assert.throws(() => petSchema.parse({ ...validPet, species: 'Snake' }));
});

test('requires the second breed when mixed breed is selected', () => {
  assert.throws(() => petSchema.parse({ ...validPet, mixed_breed: true }));
});

test('rejects future dates', () => {
  assert.throws(() => petSchema.parse({ ...validPet, birth_date: '2099-01-01' }));
});
