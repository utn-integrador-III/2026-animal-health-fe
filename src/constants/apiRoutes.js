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
    ALLERGIES: {
      BY_PET: (petId) => `/api/pets/${petId}/allergies`,
      SPECIFIC: (petId, id) => `/api/pets/${petId}/allergies/${id}`,
    },
  },
  APPOINTMENTS: {
    BASE: '/api/appointments',
    FOLLOW_UP: '/api/appointments/follow-up',
    VETERINARIANS: '/api/appointments/veterinarians',
    AVAILABLE_SLOTS: '/api/appointments/available-slots',
  },
  CONTACT: {
    BASE: '/api/contact',
  },
  CONSULTATIONS: {
    CLIENTS: '/api/consultations/clients',
    WALK_IN: '/api/consultations/walk-in',
    DIAGNOSES: (consultationId) => `/api/consultations/${consultationId}/diagnoses`,
  },
};
