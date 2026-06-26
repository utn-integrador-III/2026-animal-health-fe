export const API_ROUTES = {

  // ── Authentication ──────────────────────────────────────────────────────────
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN:    '/api/auth/login',
    LOGOUT:   '/api/auth/logout',
    PROFILE:  '/api/auth/profile',   // GET + PUT
    PROFILE_PHOTO: '/api/auth/profile/photo',
  },

  CONTACT: '/api/contact',

  // ── Clients ─────────────────────────────────────────────────────────────────
  CLIENTS: {
    BASE:  '/api/clients',
    BY_ID: (id) => `/api/clients/${id}`,
  },

  // ── Pets ────────────────────────────────────────────────────────────────────
  PETS: {
    BASE:         '/api/pets',
    BY_ID:        (id) => `/api/pets/${id}`,
    HISTORY:      (id) => `/api/pets/${id}/history`,
    VACCINATIONS: (id) => `/api/pets/${id}/vaccinations`,
    MEDICATIONS:  (id) => `/api/pets/${id}/medications`,
    LAB_RESULTS:  (id) => `/api/pets/${id}/lab-results`,
  },

};
