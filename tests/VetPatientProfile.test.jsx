import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import VetPatientProfile from '../src/pages/veterinarian/VetPatientProfile';
import useAuthStore from '../src/stores/useAuthStore';
import useLanguageStore from '../src/stores/useLanguageStore';

const mutateAsync = vi.fn();
const completeAppointment = vi.fn();

function getTestAppointmentDate() {
  const date = new Date();
  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().split('T')[0];
}

vi.mock('../src/hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    data: [
      {
        id: 'appointment-1',
        pet_id: 'pet-1',
        pet_name: 'Lola',
        pet_species: 'Bird',
        pet_breed: 'Ninfa',
        pet_sex: 'Female',
        pet_birth_date: '2024-07-13',
        pet_weight_kg: 0.085,
        pet_photo_url: 'https://example.com/lola.png',
        owner_name: 'Abby Ramirez',
        veterinarian_name: 'Maria Sanchez',
        appointment_date: '2026-07-20',
        appointment_time: '09:00:00',
        duration_blocks: 2,
        reason: 'Revision de seguimiento',
        status: 'scheduled',
      },
    ],
    isLoading: false,
    isError: false,
  })),
  useAvailableSlots: vi.fn(() => ({
    data: {
      slots: ['10:00', '10:30'],
    },
  })),
  useCreateFollowUpAppointment: vi.fn(() => ({
    mutateAsync,
    isPending: false,
  })),
  useCompleteAppointment: vi.fn(() => ({
    mutateAsync: completeAppointment,
    isPending: false,
  })),
}));

vi.mock('../src/hooks/useVaccines', () => ({
  useVaccinesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
}));

vi.mock('../src/hooks/useMedical', () => ({
  useClinicalRecordsList: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
  useAddClinicalRecord: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useMedicationsList: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
  useAddMedication: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('../src/hooks/useAllergies', () => ({
  useAllergiesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
  useAddAllergy: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateAllergy: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteAllergy: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

describe('VetPatientProfile', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    completeAppointment.mockReset();
    useLanguageStore.setState({ language: 'es' });
    useAuthStore.setState({
      user: {
        id: 'vet-1',
        full_name: 'Maria Sanchez',
        email: 'vet@example.com',
        role: 'veterinarian',
      },
      role: 'veterinarian',
      token: 'vet-token',
      authStatus: 'authenticated',
    });
  });

  test('shows the patient profile and current appointment details', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('img', { name: 'Lola' })).toHaveAttribute(
      'src',
      'https://example.com/lola.png',
    );
    expect(screen.getByText('Lola')).toBeInTheDocument();
    expect(screen.getByText('Ninfa')).toBeInTheDocument();
    expect(screen.getByText('0.085 kg')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /citas/i }));

    expect(screen.getByRole('heading', { name: /cita solicitada por el cliente/i })).toBeInTheDocument();
    expect(screen.getByText('Abby Ramirez')).toBeInTheDocument();
    expect(screen.getByText('Maria Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Revision de seguimiento')).toBeInTheDocument();
  });

  test('creates a follow-up appointment for the current pet', async () => {
    mutateAsync.mockResolvedValueOnce({});
    const user = userEvent.setup();
    const appointmentDate = getTestAppointmentDate();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /nueva consulta/i }));
    await user.type(screen.getByLabelText(/fecha/i), appointmentDate);
    await user.selectOptions(screen.getByLabelText(/duraci/i), '2');
    await user.selectOptions(screen.getByLabelText(/hora/i), '10:00');
    await user.type(screen.getByLabelText(/motivo de la visita/i), 'Control de evolucion');
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      pet_id: 'pet-1',
      appointment_date: appointmentDate,
      appointment_time: '10:00',
      duration_blocks: 2,
      reason: 'Control de evolucion',
    });
    expect(await screen.findByText(/cita de seguimiento creada correctamente/i)).toBeInTheDocument();
  });

  test('saves the clinical observation when finishing the appointment', async () => {
    completeAppointment.mockResolvedValueOnce({});
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /citas/i }));
    await user.type(
      screen.getByLabelText(/observacion de la atencion/i),
      'Se realiza revision general y limpieza de pico.',
    );
    await user.click(screen.getByRole('button', { name: /terminar cita/i }));

    expect(screen.getByRole('heading', {
      name: /deseas terminar con la cita y guardar las siguientes observaciones/i,
    })).toBeInTheDocument();
    expect(screen.getByText(/cita - observacion veterinaria/i)).toBeInTheDocument();
    expect(screen.getAllByText('Se realiza revision general y limpieza de pico.').length).toBeGreaterThan(1);
    expect(completeAppointment).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /terminar y guardar/i }));

    expect(completeAppointment).toHaveBeenCalledWith({
      appointmentId: 'appointment-1',
      clinicalObservation: 'Se realiza revision general y limpieza de pico.',
    });
    expect(await screen.findByText(/cita finalizada correctamente/i)).toBeInTheDocument();
  });
});
