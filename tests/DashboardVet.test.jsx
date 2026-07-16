import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import DashboardVet from '../src/pages/veterinarian/DashboardVet';
import useAuthStore from '../src/stores/useAuthStore';

const today = new Date().toISOString().split('T')[0];

vi.mock('../src/hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    data: [
      {
        id: 'appointment-1',
        pet_name: 'Lola',
        pet_species: 'Bird',
        pet_photo_url: 'https://example.com/lola.png',
        owner_name: 'Abby Ramirez',
        pet_breed: 'Ninfa',
        appointment_date: today,
        appointment_time: '09:00',
        last_visit: '2026-06-01',
        status: 'scheduled',
      },
    ],
    isLoading: false,
    isError: false,
  })),
}));

describe('DashboardVet', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'vet-1',
        full_name: 'Williams',
        email: 'vet@example.com',
        role: 'veterinarian',
      },
      role: 'veterinarian',
      token: 'vet-token',
      authStatus: 'authenticated',
    });
  });

  test("shows today's veterinarian patients from appointments", () => {
    render(
      <MemoryRouter>
        <DashboardVet />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /hi dr\. williams/i })).toBeInTheDocument();
    expect(screen.getByText(/appointments selected day/i)).toBeInTheDocument();
    expect(screen.getByText(/monthly workload/i)).toBeInTheDocument();
    expect(screen.getByText('Lola')).toBeInTheDocument();
    expect(screen.getByAltText('Lola')).toHaveAttribute('src', 'https://example.com/lola.png');
    expect(screen.getByText('Abby Ramirez')).toBeInTheDocument();
    expect(screen.getByText('Bird')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start appointment/i })).toHaveAttribute(
      'href',
      '/vet/patients/appointment-1',
    );
  });
});
