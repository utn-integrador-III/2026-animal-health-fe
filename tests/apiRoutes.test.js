import { describe, expect, test } from 'vitest';
import { API_ROUTES } from '../src/constants/apiRoutes';

describe('API_ROUTES constants', () => {
  test('returns correct endpoint strings for auth routes', () => {
    expect(API_ROUTES.AUTH.LOGIN).toBe('/api/auth/login');
    expect(API_ROUTES.AUTH.REGISTER).toBe('/api/auth/register');
    expect(API_ROUTES.AUTH.PROFILE).toBe('/api/auth/profile');
    expect(API_ROUTES.AUTH.PROFILE_PHOTO).toBe('/api/auth/profile/photo');
    expect(API_ROUTES.AUTH.PROFILE_PASSWORD).toBe('/api/auth/profile/password');
  });

  test('returns correct dynamic URL paths for pet routes', () => {
    expect(API_ROUTES.PETS.BASE).toBe('/api/pets');
    expect(API_ROUTES.PETS.CLINICAL_RECORDS('pet-123')).toBe('/api/pets/pet-123/clinical-records');
    expect(API_ROUTES.PETS.MEDICATIONS('pet-123')).toBe('/api/pets/pet-123/medications');
    expect(API_ROUTES.PETS.MEDICATIONS_TOGGLE('pet-123', 'med-456')).toBe(
      '/api/pets/pet-123/medications/med-456/toggle-check'
    );
    expect(API_ROUTES.PETS.LAB_RESULTS('pet-123')).toBe('/api/pets/pet-123/lab-results');
    expect(API_ROUTES.PETS.ALLERGIES.BY_PET('pet-123')).toBe('/api/pets/pet-123/allergies');
    expect(API_ROUTES.PETS.ALLERGIES.SPECIFIC('pet-123', 'alg-99')).toBe(
      '/api/pets/pet-123/allergies/alg-99'
    );
    expect(API_ROUTES.PETS.DIAGNOSES.BY_PET('pet-123')).toBe('/api/pets/pet-123/diagnoses');
    expect(API_ROUTES.PETS.DIAGNOSES.SPECIFIC('pet-123', 'diag-88')).toBe(
      '/api/pets/pet-123/diagnoses/diag-88'
    );
    expect(API_ROUTES.PETS.VACCINES('pet-123')).toBe('/api/pets/pet-123/vaccines');
  });

  test('returns correct endpoint strings for appointment routes', () => {
    expect(API_ROUTES.APPOINTMENTS.BASE).toBe('/api/appointments');
    expect(API_ROUTES.APPOINTMENTS.FOLLOW_UP).toBe('/api/appointments/follow-up');
    expect(API_ROUTES.APPOINTMENTS.VETERINARIANS).toBe('/api/appointments/veterinarians');
    expect(API_ROUTES.APPOINTMENTS.AVAILABLE_SLOTS).toBe('/api/appointments/available-slots');
  });

  test('returns correct dynamic URL paths for notification routes', () => {
    expect(API_ROUTES.NOTIFICATIONS.BASE).toBe('/api/notifications/');
    expect(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT).toBe('/api/notifications/unread-count');
    expect(API_ROUTES.NOTIFICATIONS.READ_ALL).toBe('/api/notifications/read-all');
    expect(API_ROUTES.NOTIFICATIONS.READ('n-1')).toBe('/api/notifications/n-1/read');
    expect(API_ROUTES.NOTIFICATIONS.DELETE('n-1')).toBe('/api/notifications/n-1');
    expect(API_ROUTES.NOTIFICATIONS.TAKE('n-1')).toBe('/api/notifications/n-1/take');
    expect(API_ROUTES.NOTIFICATIONS.REMIND_LATER('n-1')).toBe('/api/notifications/n-1/remind-later');
  });

  test('returns correct endpoint strings for contact and consultation routes', () => {
    expect(API_ROUTES.CONTACT.BASE).toBe('/api/contact');
    expect(API_ROUTES.CONSULTATIONS.CLIENTS).toBe('/api/consultations/clients');
    expect(API_ROUTES.CONSULTATIONS.WALK_IN).toBe('/api/consultations/walk-in');
    expect(API_ROUTES.CONSULTATIONS.DIAGNOSES('c-100')).toBe('/api/consultations/c-100/diagnoses');
  });

  test('returns correct endpoint strings for admin routes', () => {
    expect(API_ROUTES.ADMIN.VETERINARIANS).toBe('/api/admin/veterinarians');
  });

  test('returns correct dynamic URL paths for AI routes', () => {
    expect(API_ROUTES.AI.BREED_RISK_ALERTS('pet-123')).toBe(
      '/api/ai/pets/pet-123/breed-risk-alerts'
    );
    expect(API_ROUTES.AI.CARE_RECOMMENDATIONS('pet-123')).toBe(
      '/api/ai/pets/pet-123/care-recommendations'
    );
  });
});
