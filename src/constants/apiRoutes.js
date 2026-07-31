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
  NOTIFICATIONS: {
    BASE: '/api/notifications/',
    UNREAD_COUNT: '/api/notifications/unread-count',
    READ_ALL: '/api/notifications/read-all',
    READ: (id) => `/api/notifications/${id}/read`,
    DELETE: (id) => `/api/notifications/${id}`,
    TAKE: (id) => `/api/notifications/${id}/take`,
    REMIND_LATER: (id) => `/api/notifications/${id}/remind-later`,
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
