export const ROUTES = {
  PUBLIC: {
    ABOUT: '/about',
    SERVICES: '/services',
    CONTACT: '/contact',
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    UNAUTHORIZED: '/unauthorized',
  },
  CLIENT: {
    DASHBOARD: '/client/pets',
    PETS: '/client/pets',
    PROFILE: '/client/profile',
    PET_DETAIL: '/client/pets/:petId',
    PET_EDIT: '/client/pets/:petId/edit',
    PET_HISTORY: '/client/pets/:petId/history',
  },
  VET: {
    DASHBOARD: '/vet/dashboard',
    PROFILE: '/vet/profile',
  },
};
