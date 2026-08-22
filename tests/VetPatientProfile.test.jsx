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

function getFutureDate(daysToAdd = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
}

const breedRiskHookState = vi.hoisted(() => ({
  result: {
    data: {
      pet_id: 'pet-1',
      name: 'Lola',
      species: 'Bird',
      breed_primary: 'Ninfa',
      breed_secondary: null,
      birth_date: '2024-07-13',
      age_years: 2,
      age_months: 1,
      age_days: 3,
      alerts: [
        {
          title: 'Respiratory sensitivity',
          description: 'Cockatiels may be sensitive to poor air quality.',
          severity: 'moderate',
          recommendation: 'Review ventilation and avoid smoke exposure.',
        },
      ],
      preventive_recommendations: [
        'Schedule regular wellness checks.',
        'Monitor appetite and feather condition.',
      ],
      non_diagnostic_warning: 'AI guidance is informational and not a diagnosis.',
      generated_by: 'gemini',
    },
    isLoading: false,
    isError: false,
  },
}));

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

vi.mock('../src/hooks/useBreedRiskAlerts', () => ({
  useBreedRiskAlerts: vi.fn(() => breedRiskHookState.result),
}));

describe('VetPatientProfile', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    mutateAsync.mockReset();
    completeAppointment.mockReset();
    breedRiskHookState.result = {
      data: {
        pet_id: 'pet-1',
        name: 'Lola',
        species: 'Bird',
        breed_primary: 'Ninfa',
        breed_secondary: null,
        birth_date: '2024-07-13',
        age_years: 2,
        age_months: 1,
        age_days: 3,
        alerts: [
          {
            title: 'Respiratory sensitivity',
            description: 'Cockatiels may be sensitive to poor air quality.',
            severity: 'moderate',
            recommendation: 'Review ventilation and avoid smoke exposure.',
          },
        ],
        preventive_recommendations: [
          'Schedule regular wellness checks.',
          'Monitor appetite and feather condition.',
        ],
        non_diagnostic_warning: 'AI guidance is informational and not a diagnosis.',
        generated_by: 'gemini',
        recommendation_id: 'latest-recommendation',
        history: [
          {
            recommendation_id: 'latest-recommendation',
            generated_at: '2026-08-21T15:00:00+00:00',
            alerts: [
              {
                title: 'Respiratory sensitivity',
                description: 'Cockatiels may be sensitive to poor air quality.',
                severity: 'moderate',
                recommendation: 'Review ventilation and avoid smoke exposure.',
              },
            ],
            preventive_recommendations: [
              'Schedule regular wellness checks.',
              'Monitor appetite and feather condition.',
            ],
            non_diagnostic_warning: 'AI guidance is informational and not a diagnosis.',
            generated_by: 'gemini',
          },
          {
            recommendation_id: 'previous-recommendation',
            generated_at: '2026-08-20T15:00:00+00:00',
            alerts: [
              {
                title: 'Previous respiratory note',
                description: 'Older generated context.',
                severity: 'low',
                recommendation: 'Keep monitoring respiratory pattern.',
              },
            ],
            preventive_recommendations: ['Previous preventive recommendation.'],
            non_diagnostic_warning: 'Previous informational warning.',
            generated_by: 'gemini',
          },
        ],
      },
      isLoading: false,
      isError: false,
    };
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

  test('submits diagnosis information from the veterinary patient profile', async () => {
    const { useAddDiagnosis } = await import('../src/hooks/useDiagnoses');
    const addDiagnosis = vi.fn().mockResolvedValueOnce({});
    useAddDiagnosis.mockReturnValue({
      mutateAsync: addDiagnosis,
      isPending: false,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /diagn[oó]sticos/i }));
    await user.type(screen.getByLabelText(/diagn[oó]stico definitivo/i), 'Traumatismo leve');
    await user.type(screen.getByLabelText(/resumen del tratamiento/i), 'Reposo y monitoreo por 48 horas');
    await user.click(screen.getByRole('button', { name: /completar consulta/i }));

    expect(addDiagnosis).toHaveBeenCalledWith({
      petId: 'pet-1',
      diagnosisData: expect.objectContaining({
        pet_id: 'pet-1',
        diagnosis: 'Traumatismo leve',
        treatment: 'Reposo y monitoreo por 48 horas',
      }),
    });
  });

  test('prescribes medication from the veterinary patient profile', async () => {
    const { useAddMedication, useMedicationsList } = await import('../src/hooks/useMedical');
    const addMedication = vi.fn().mockResolvedValueOnce({});
    useAddMedication.mockReturnValue({
      mutateAsync: addMedication,
      isPending: false,
    });
    useMedicationsList.mockReturnValue({
      data: [
        {
          id: 'med-1',
          name: 'Amoxicilina',
          dosage: '250 mg',
          frequency: 'Cada 12 horas',
          administration_time: '08:00',
          start_date: getFutureDate(),
          end_date: getFutureDate(7),
          notes: 'Dar con alimentos',
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
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /medicamentos/i }));

    expect(screen.getByText('Amoxicilina')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('ej. Amoxicilina'), 'Cefalexina');
    await user.type(screen.getByPlaceholderText('ej. 1/2 tableta'), '500 mg');
    await user.type(screen.getByPlaceholderText('ej. Cada 12 horas'), 'Cada 8 horas');
    fireEvent.change(screen.getByLabelText(/hora de administraci/i), {
      target: { value: '08:00' },
    });
    fireEvent.change(screen.getByLabelText(/fecha inicio/i), {
      target: { value: getFutureDate() },
    });
    fireEvent.change(screen.getByLabelText(/fecha fin/i), {
      target: { value: getFutureDate(7) },
    });
    await user.type(screen.getByPlaceholderText('ej. Dar con alimentos'), 'Administrar con comida');
    await user.click(screen.getByRole('button', { name: /agregar medicamento|recetar medicamento/i }));

    expect(addMedication).toHaveBeenCalledWith({
      petId: 'pet-1',
      medicationData: expect.objectContaining({
        name: 'Cefalexina',
        dosage: '500 mg',
        frequency: 'Cada 8 horas',
        administration_time: '08:00',
        start_date: getFutureDate(),
        end_date: getFutureDate(7),
        notes: 'Administrar con comida',
      }),
    });
  });

  test('adds, edits, cancels, and deletes allergies from the veterinary patient profile', async () => {
    const {
      useAddAllergy,
      useAllergiesList,
      useDeleteAllergy,
      useUpdateAllergy,
    } = await import('../src/hooks/useAllergies');
    const addAllergy = vi.fn().mockResolvedValueOnce({});
    const updateAllergy = vi.fn().mockResolvedValueOnce({});
    const deleteAllergy = vi.fn().mockResolvedValueOnce({});
    useAddAllergy.mockReturnValue({ mutateAsync: addAllergy, isPending: false });
    useUpdateAllergy.mockReturnValue({ mutateAsync: updateAllergy, isPending: false });
    useDeleteAllergy.mockReturnValue({ mutateAsync: deleteAllergy, isPending: false });
    useAllergiesList.mockReturnValue({
      data: [
        {
          id: 'allergy-1',
          allergen: 'Polen',
          category: 'environmental',
          severity: 'moderate',
          reaction: 'Estornudos',
          notes: 'Evitar jardines con flores',
          veterinarian_name: 'Maria Sanchez',
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
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /alergias/i }));

    expect(screen.getByText('Polen')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /editar/i }));
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    await user.type(screen.getByLabelText(/al[eé]rgeno/i), 'Picadura de pulga');
    await user.selectOptions(screen.getByLabelText(/categor[ií]a/i), 'environmental');
    await user.selectOptions(screen.getByLabelText(/severidad/i), 'mild');
    await user.type(screen.getByLabelText(/reacci[oó]n/i), 'Irritacion leve');
    await user.type(screen.getByLabelText(/notas/i), 'Controlar piel semanalmente');
    await user.click(screen.getByRole('button', { name: /registrar alergia|agregar alergia/i }));

    expect(addAllergy).toHaveBeenCalledWith({
      petId: 'pet-1',
      allergyData: expect.objectContaining({
        allergen: 'Picadura de pulga',
        category: 'environmental',
        severity: 'mild',
        reaction: 'Irritacion leve',
        notes: 'Controlar piel semanalmente',
      }),
    });

    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(deleteAllergy).toHaveBeenCalledWith({
      petId: 'pet-1',
      allergyId: 'allergy-1',
    });
  });

  test('shows AI breed risk alerts with age, breed, recommendations, and warning', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /recomendaciones ia/i }));

    expect(screen.getByRole('heading', { name: /alertas de riesgo por raza/i })).toBeInTheDocument();
    expect(screen.getAllByText('Lola').length).toBeGreaterThan(1);
    expect(screen.getAllByText('Ninfa').length).toBeGreaterThan(1);
    expect(screen.getByText(/2 anos, 1 meses, 3 dias/i)).toBeInTheDocument();
    expect(screen.getByText('Respiratory sensitivity')).toBeInTheDocument();
    expect(screen.getByText(/Review ventilation and avoid smoke exposure/i)).toBeInTheDocument();
    expect(screen.getByText('AI guidance is informational and not a diagnosis.')).toBeInTheDocument();
  });

  test('lets the veterinarian choose previous AI recommendation versions', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /recomendaciones ia/i }));
    await user.selectOptions(screen.getByLabelText(/historial de recomendaciones/i), 'previous-recommendation');

    expect(screen.getByText('Previous respiratory note')).toBeInTheDocument();
    expect(screen.getByText(/Keep monitoring respiratory pattern/i)).toBeInTheDocument();
    expect(screen.getByText('Previous informational warning.')).toBeInTheDocument();
  });

  test('shows the AI loading state', async () => {
    breedRiskHookState.result = {
      data: undefined,
      isLoading: true,
      isError: false,
    };
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /recomendaciones ia/i }));

    expect(screen.getByText(/generando alertas de riesgo por raza/i)).toBeInTheDocument();
  });

  test('shows the AI error state', async () => {
    breedRiskHookState.result = {
      data: undefined,
      isLoading: false,
      isError: true,
    };
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/vet/patients/appointment-1']}>
        <Routes>
          <Route path="/vet/patients/:appointmentId" element={<VetPatientProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /recomendaciones ia/i }));

    expect(screen.getByText(/no se pudieron cargar las recomendaciones de ia/i)).toBeInTheDocument();
  });
});
