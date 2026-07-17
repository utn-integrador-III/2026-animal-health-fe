/**
 * Pet-related constants.
 * Single source of truth for species, sex, and species icon mappings.
 * Import these wherever pet data needs to be displayed or validated.
 */

/** Supported pet species. Each entry has a value sent to the API and a label shown in the UI. */
export const PET_SPECIES = [
  { value: 'Dog',        label: '🐶 Dog' },
  { value: 'Cat',        label: '🐱 Cat' },
  { value: 'Rabbit',     label: '🐰 Rabbit' },
  { value: 'Hamster',    label: '🐹 Hamster' },
  { value: 'Guinea Pig', label: '🐾 Guinea pig' },
  { value: 'Fish',       label: '🐟 Ornamental fish' },
  { value: 'Bird',       label: '🐦 Domestic bird' },
  { value: 'Turtle',     label: '🐢 Domestic turtle' },
  { value: 'Ferret',     label: '🐾 Ferret' },
  { value: 'Chinchilla', label: '🐭 Chinchilla' },
  { value: 'Gerbil',     label: '🐾 Gerbil' },
  { value: 'Rat',        label: '🐀 Domestic rat' },
  { value: 'Mouse',      label: '🐁 Domestic mouse' },
];

/** Supported pet sex options. */
export const PET_SEX = [
  { value: 'Male',   label: 'Male' },
  { value: 'Female', label: 'Female' },
];

/**
 * Maps a species value to an emoji icon.
 * Falls back to '🐾' for unknown species.
 */
export const SPECIES_ICON = {
  Dog:     '🐶',
  Cat:     '🐱',
  Rabbit:  '🐰',
  Bird:    '🐦',
  Reptile: '🦎',
  Hamster: '🐹',
  Other:   '🐾',
};

/** Fallback icon when the species is unknown or not in SPECIES_ICON. */
export const DEFAULT_PET_ICON = '🐾';

/** Weight input constraints (kilograms). */
export const PET_WEIGHT = {
  STEP: '0.1',
  MIN: '0.1',
  MAX: '999',
};
