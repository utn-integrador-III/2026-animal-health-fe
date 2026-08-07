export const USER_ROLES = {
  CLIENT: 'client',
  VETERINARIAN: 'veterinarian',
  ADMIN: 'admin',
};

export const ROLE_HOME = {
  [USER_ROLES.CLIENT]: '/client/pets',
  [USER_ROLES.VETERINARIAN]: '/vet/dashboard',
  [USER_ROLES.ADMIN]: '/admin/dashboard',
};
