import { z } from 'zod';

/**
 * Zod schema for the pet registration / edit form.
 * Aligns with the backend PetCreate / PetUpdate Pydantic schemas.
 */
export const petSchema = z.object({
  name: z
    .string({ required_error: 'Pet name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),

  birth_date: z
    .string({ required_error: 'Date of birth is required' })
    .min(1, 'Date of birth is required')
    .refine(
      (value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)),
      'Date of birth is invalid',
    )
    .refine(
      (value) => new Date(`${value}T00:00:00`) <= new Date(),
      'Date of birth cannot be in the future',
    ),

  species: z
    .string({ required_error: 'Species is required' })
    .min(1, 'Please select a species')
    .refine(
      (value) => [
        'Dog', 'Cat', 'Rabbit', 'Hamster', 'Guinea Pig', 'Fish', 'Bird',
        'Turtle', 'Ferret', 'Chinchilla', 'Gerbil', 'Rat', 'Mouse',
      ].includes(value),
      'Please select an allowed domestic species',
    ),

  sex: z
    .string({ required_error: 'Sex is required' })
    .min(1, 'Please select a sex')
    .refine((value) => ['Female', 'Male'].includes(value), 'Select Female or Male'),

  breed_primary: z
    .string({ required_error: 'Primary breed is required' })
    .min(2, 'Breed must be at least 2 characters')
    .max(80, 'Breed must be at most 80 characters'),

  breed_secondary: z.string().optional(),

  mixed_breed: z.boolean().default(false),

  weight_kg: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return NaN;
      return Number(val);
    })
    .refine((val) => Number.isFinite(val), 'Weight is required')
    .refine((val) => val > 0, 'Weight must be greater than 0')
    .refine((val) => val <= 999, 'Weight must be 999 kg or less'),
}).superRefine((data, context) => {
  if (data.mixed_breed && !data.breed_secondary?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['breed_secondary'],
      message: 'Secondary breed is required for a mixed-breed pet',
    });
  }
});
