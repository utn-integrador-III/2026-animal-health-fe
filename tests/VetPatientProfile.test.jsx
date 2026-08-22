import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import VetPatientProfile from '../src/pages/veterinarian/VetPatientProfile';
import useAuthStore from '../src/stores/useAuthStore';
import useLanguageStore from '../src/stores/useLanguageStore';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

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

vi.mock('../src/hooks/useDiagnoses', () => ({
  useDiagnosesList: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
  useAddDiagnosis: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
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

  test('submits diagnosis form and handles success and error in VetPatientProfile', async () => {
    const mockAddDiagnosisMutate = vi.fn();
    const { useAddDiagnosis } = await import('../src/hooks/useDiagnoses');
    useAddDiagnosis.mockReturnValue({ mutateAsync: mockAddDiagnosisMutate, isPending: false });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>
    );

    // Open diagnoses section by clicking its clinical card
    await user.click(screen.getByRole('button', { name: /diagnosticos|diagnósticos/i }));

    const diagnosisInput = screen.getByLabelText(/diagnóstico definitivo \*/i);
    await user.type(diagnosisInput, 'Traumatismo leve');

    // Submit diagnosis form
    mockAddDiagnosisMutate.mockResolvedValueOnce({});
    const submitBtn = screen.getByRole('button', { name: /completar consulta/i });
    await user.click(submitBtn);

    expect(mockAddDiagnosisMutate).toHaveBeenCalledWith({
      petId: 'pet-1',
      diagnosisData: expect.objectContaining({ diagnosis: 'Traumatismo leve' }),
    });

    // Test rejection
    mockAddDiagnosisMutate.mockRejectedValueOnce(new Error('Save failed'));
    await user.click(submitBtn);
  });

    beforeEach(() => {
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test('handles medications section (prescribing medication)', async () => {
      const mockAddMedicationMutate = vi.fn().mockResolvedValueOnce({});
      const { useAddMedication, useMedicationsList } = await import('../src/hooks/useMedical');
      useAddMedication.mockReturnValue({ mutateAsync: mockAddMedicationMutate, isPending: false });
      useMedicationsList.mockReturnValue({
        data: [
          {
            id: 'm1',
            name: 'Amoxicilina',
            dosage: '250mg',
            frequency: 'Cada 12 horas',
            status: 'active',
            start_date: '2026-08-01',
            end_date: '2026-08-10',
            veterinarian_name: 'Dr. Ruiz',
            notes: 'Con comida',
          },
        ],
        isLoading: false,
        isError: false,
      });

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
          <Routes>
            <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
          </Routes>
        </MemoryRouter>
      );

      // Click medications tab
      const medTab = screen.getByRole('button', { name: /medicamentos|tratamientos/i });
      await user.click(medTab);

      expect(screen.getByText('Amoxicilina')).toBeInTheDocument();

      // Fill form
      await user.type(screen.getByPlaceholderText('ej. Amoxicilina'), 'Cefalexina');
      await user.type(screen.getByPlaceholderText('ej. 1/2 tableta'), '500mg');
      await user.type(screen.getByPlaceholderText('ej. Cada 12 horas'), 'Cada 8 horas');
      fireEvent.change(screen.getByLabelText(/hora de administración/i), { target: { value: '08:00' } });
      fireEvent.change(screen.getByLabelText(/fecha inicio/i), { target: { value: '2026-08-22' } });
      fireEvent.change(screen.getByLabelText(/fecha fin/i), { target: { value: '2026-08-29' } });

      await user.click(screen.getByRole('button', { name: /recetar medicamento/i }));

      expect(mockAddMedicationMutate).toHaveBeenCalledWith({
        petId: 'pet-1',
        medicationData: expect.objectContaining({ name: 'Cefalexina', dosage: '500mg' }),
      });
    });

    test('handles allergies section (add, edit, cancel edit, delete)', async () => {
      const mockAddAllergyMutate = vi.fn().mockResolvedValueOnce({});
      const mockUpdateAllergyMutate = vi.fn().mockResolvedValueOnce({});
      const mockDeleteAllergyMutate = vi.fn().mockResolvedValueOnce({});
      const { useAllergiesList, useAddAllergy, useUpdateAllergy, useDeleteAllergy } = await import('../src/hooks/useAllergies');

      useAllergiesList.mockReturnValue({
        data: [
          {
            id: 'alg-1',
            allergen: 'Polen',
            category: 'environmental',
            severity: 'mild',
            reaction: 'Estornudos',
            notes: 'En primavera',
            veterinarian_name: 'Dr. Ruiz',
          },
        ],
        isLoading: false,
        isError: false,
      });
      useAddAllergy.mockReturnValue({ mutateAsync: mockAddAllergyMutate, isPending: false });
      useUpdateAllergy.mockReturnValue({ mutateAsync: mockUpdateAllergyMutate, isPending: false });
      useDeleteAllergy.mockReturnValue({ mutateAsync: mockDeleteAllergyMutate, isPending: false });

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
          <Routes>
            <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
          </Routes>
        </MemoryRouter>
      );

      // Switch to allergies tab
      await user.click(screen.getByRole('button', { name: /alergias/i }));
      expect(screen.getByText('Polen')).toBeInTheDocument();

      // Edit existing allergy
      await user.click(screen.getByRole('button', { name: /editar/i }));

      // Cancel edit
      await user.click(screen.getByRole('button', { name: /^cancelar$/i }));

      // Fill & Add new allergy
      await user.type(screen.getByLabelText(/alérgeno \*/i), 'Picadura de pulga');
      await user.selectOptions(screen.getByLabelText(/categoría \*/i), 'environmental');
      await user.selectOptions(screen.getByLabelText(/severidad \*/i), 'mild');

      await user.click(screen.getByRole('button', { name: /registrar alergia|agregar alergia/i }));

      expect(mockAddAllergyMutate).toHaveBeenCalledWith({
        petId: 'pet-1',
        allergyData: expect.objectContaining({ allergen: 'Picadura de pulga' }),
      });

      // Delete existing allergy
      await user.click(screen.getByRole('button', { name: /eliminar/i }));
      expect(mockDeleteAllergyMutate).toHaveBeenCalledWith({
        petId: 'pet-1',
        allergyId: 'alg-1',
      });
    });
});
