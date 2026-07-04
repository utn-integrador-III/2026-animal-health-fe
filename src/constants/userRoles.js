export const USER_ROLES = {
  CLIENT: 'client',
  VETERINARIAN: 'veterinarian',
};

export const ROLE_HOME = {
  [USER_ROLES.CLIENT]: '/client/pets',
  [USER_ROLES.VETERINARIAN]: '/vet/dashboard',
};