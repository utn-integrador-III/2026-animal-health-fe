import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import AppointmentCalendar from '../src/pages/client/appointments/AppointmentCalendar';

const createAppointment = vi.fn();
const updateAppointment = vi.fn();
const cancelAppointment = vi.fn();

vi.mock('../src/hooks/usePets', () => ({
  usePet: vi.fn(() => ({
    data: {
      id: 'pet-1',
      name: 'Loli',
      species: 'Bird',
      sex: 'Female',
      photo_url: 'https://example.com/lola.png',
    },
    isLoading: false,
  })),
}));

vi.mock('../src/hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    data: [
      {
        id: 'appointment-1',
        pet_id: 'pet-1',
        pet_name: 'Loli',
        pet_species: 'Bird',
        pet_photo_url: 'https://example.com/lola-appointment.png',
        appointment_date: '2026-07-20',
        appointment_time: '10:00',
        reason: 'Dental checkup',
        veterinarian_id: 'vet-1',
        veterinarian_name: 'Dr. Maria Sanchez',
        status: 'scheduled',
      },
      {
        id: 'appointment-2',
        pet_id: 'pet-1',
        pet_name: 'Loli',
        pet_species: 'Bird',
        pet_photo_url: 'https://example.com/lola-appointment.png',
        appointment_date: '2026-07-16',
        appointment_time: '09:00',
        reason: 'Beak polish',
        veterinarian_id: 'vet-1',
        veterinarian_name: 'Dr. Maria Sanchez',
        status: 'completed',
        clinical_observation: 'Se realizo el pulido de pico anual del ave.',
      },
    ],
    isLoading: false,
    isError: false,
  })),
  useVeterinarians: vi.fn(() => ({
    data: [{ id: 'vet-1', full_name: 'Dr. Maria Sanchez', email: 'vet@example.com' }],
  })),
  useAvailableSlots: vi.fn(() => ({
    data: { slots: ['09:00', '10:00', '11:00'] },
  })),
  useCreateAppointment: vi.fn(() => ({
    mutateAsync: createAppointment,
    isPending: false,
  })),
  useUpdateAppointment: vi.fn(() => ({
    mutateAsync: updateAppointment,
    isPending: false,
  })),
  useCancelAppointment: vi.fn(() => ({
    mutateAsync: cancelAppointment,
    isPending: false,
  })),
}));

function renderAppointments() {
  return render(
    <MemoryRouter initialEntries={['/client/appointments?petId=pet-1']}>
      <AppointmentCalendar />
    </MemoryRouter>,
  );
}

describe('AppointmentCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows appointments for the selected pet', () => {
    renderAppointments();

    expect(screen.getByRole('heading', { name: /appointments/i })).toBeInTheDocument();
    expect(screen.getByText('Loli')).toBeInTheDocument();
    expect(screen.getAllByAltText('Loli')).toHaveLength(2);
    screen.getAllByAltText('Loli').forEach((image) => {
      expect(image).toHaveAttribute('src', 'https://example.com/lola-appointment.png');
    });
    expect(screen.getAllByText(/dental checkup/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/dr\. maria sanchez/i)).toBeInTheDocument();
  });

  test('opens the new appointment form and submits appointment data', async () => {
    const user = userEvent.setup();
    createAppointment.mockResolvedValueOnce({});
    renderAppointments();

    await user.click(screen.getByRole('button', { name: /request appointment/i }));

    expect(screen.getByText(/choose the right appointment length/i)).toBeInTheDocument();
    expect(screen.getByText(/30 minutes: quick visit/i)).toBeInTheDocument();
    expect(screen.getByText(/1 hour: dedicated consultation/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^date$/i), '2026-07-28');
    await user.selectOptions(screen.getByLabelText(/veterinarian/i), 'vet-1');
    await user.selectOptions(screen.getByLabelText(/^time$/i), '09:00');
    await user.type(screen.getByLabelText(/reason for visit/i), 'Annual wellness checkup');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(createAppointment).toHaveBeenCalledWith({
      pet_id: 'pet-1',
      appointment_date: '2026-07-28',
      appointment_time: '09:00',
      duration_blocks: 1,
      reason: 'Annual wellness checkup',
      veterinarian_id: 'vet-1',
    });
  });

  test('cancels a scheduled appointment', async () => {
    const user = userEvent.setup();
    cancelAppointment.mockResolvedValueOnce({});
    renderAppointments();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(cancelAppointment).toHaveBeenCalledWith('appointment-1');
  });

  test('shows veterinarian observation in completed appointment history', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await user.click(screen.getByRole('button', { name: /history/i }));

    expect(screen.getByText(/beak polish/i)).toBeInTheDocument();
    expect(screen.getByText(/veterinarian observation/i)).toBeInTheDocument();
    expect(screen.getByText(/se realizo el pulido de pico anual del ave/i)).toBeInTheDocument();
  });
});
