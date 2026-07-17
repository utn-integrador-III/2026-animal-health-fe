export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    PROFILE_PHOTO: '/api/auth/profile/photo',
    PROFILE_PASSWORD: '/api/auth/profile/password',
  },
  PETS: {
    BASE: '/api/pets',
    CLINICAL_RECORDS: (petId) => `/api/pets/${petId}/clinical-records`,
    MEDICATIONS: (petId) => `/api/pets/${petId}/medications`,
    MEDICATIONS_TOGGLE: (petId, medicationId) => `/api/pets/${petId}/medications/${medicationId}/toggle-check`,
  },
  APPOINTMENTS: {
    BASE: '/api/appointments',
    FOLLOW_UP: '/api/appointments/follow-up',
    VETERINARIANS: '/api/appointments/veterinarians',
    AVAILABLE_SLOTS: '/api/appointments/available-slots',
  },
};
