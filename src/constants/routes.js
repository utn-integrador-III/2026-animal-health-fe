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
<<<<<<< HEAD
  // ============================================================
  // NUEVO: Rutas compartidas entre clientes y veterinarios
  // ============================================================
  SHARED: {
    NOTIFICATIONS: '/notificaciones',
  },
  CLIENT: {
    DASHBOARD: '/client/dashboard',
    PETS: '/client/pets',
    PROFILE: '/client/profile',
    APPOINTMENTS: '/client/appointments',
    VACCINES: '/client/vaccines',
    MEDICATIONS: '/client/medications',
    MEDICATION_REMINDERS: '/client/medications/reminders',
    DIAGNOSTICS: '/client/diagnostics',
    ALLERGIES: '/client/allergies',
    LAB_RESULTS: '/client/lab-results',
    RECOMMENDATIONS: '/client/recommendations',
=======
  CLIENT: {
    DASHBOARD: '/client/pets',
    PETS: '/client/pets',
    PROFILE: '/client/profile',
>>>>>>> origin/R2
    PET_DETAIL: '/client/pets/:petId',
    PET_EDIT: '/client/pets/:petId/edit',
    PET_HISTORY: '/client/pets/:petId/history',
  },
  VET: {
    DASHBOARD: '/vet/dashboard',
    PROFILE: '/vet/profile',
    CONSULTATION: '/vet/consultation',
    PATIENT: '/vet/patients/:appointmentId',
    VACCINES: '/vet/patients/:appointmentId/vaccines',
    MEDICAL_HISTORY: '/vet/patients/:appointmentId/medical-history',
    REPORTS: '/vet/reports',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    VETERINARIANS: '/admin/veterinarians',
    VET_CREATE: '/admin/veterinarians/new',
  },
};
