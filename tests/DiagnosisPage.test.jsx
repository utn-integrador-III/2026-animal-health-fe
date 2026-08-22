import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import DiagnosisPage from '../src/pages/client/diagnoses/DiagnosisPage';
import { usePet } from '../src/hooks/usePets';
import { useDiagnosesList, useAddDiagnosis } from '../src/hooks/useDiagnoses';
import useLanguageStore from '../src/stores/useLanguageStore';
import useAuthStore from '../src/stores/useAuthStore';

const mockMutateAsync = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

vi.mock('../src/hooks/usePets', () => ({
  usePet: vi.fn(),
}));

vi.mock('../src/hooks/useDiagnoses', () => ({
  useDiagnosesList: vi.fn(),
  useAddDiagnosis: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  })),
}));

describe('DiagnosisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ language: 'es' });
    useAuthStore.setState({ user: { id: 'client-1', role: 'client', full_name: 'Johnny Client' } });
  });

  test('shows loading message when pet or diagnoses are loading', () => {
    usePet.mockReturnValue({ data: null, isLoading: true, isError: false });
    useDiagnosesList.mockReturnValue({ data: [], isLoading: true, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando diagnósticos/i)).toBeInTheDocument();
  });

  test('shows empty state ("No hay diagnósticos disponibles") when pet has no diagnoses', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Candy', species: 'Cat', sex: 'Female' },
      isLoading: false,
      isError: false,
    });
    useDiagnosesList.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/no hay diagnósticos disponibles/i)).toBeInTheDocument();
    expect(screen.getAllByText('Candy').length).toBeGreaterThan(0);
  });

  test('shows localized English empty state when language is set to English', () => {
    useLanguageStore.setState({ language: 'en' });
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Candy', species: 'Cat', sex: 'Female' },
      isLoading: false,
      isError: false,
    });
    useDiagnosesList.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/no diagnoses available/i)).toBeInTheDocument();
  });

  test('renders complete client diagnosis summary with all recorded fields', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Candy', species: 'Cat', sex: 'Female' },
      isLoading: false,
      isError: false,
    });
    useDiagnosesList.mockReturnValue({
      data: [
        {
          id: 'diag-1',
          diagnosis: 'Dermatitis alérgica',
          presumptive_diagnosis: 'Dermatitis atópica',
          differential_diagnoses: 'Alergia alimentaria',
          status: 'Presuntivo',
          reason: 'Rascado e inflamación',
          symptoms: 'Rascado / Picazón',
          physical_exam: 'Signos vitales normales. Piel anormal.',
          clinical_plan: 'Tratamiento antihistamínico',
          treatment: 'Antihistamínico y champú medicado',
          owner_instructions: 'Evitar pollo',
          follow_up: 'Revisión en 14 días',
          notes: 'Paciente estable',
          created_at: '2026-08-01',
          veterinarian_name: 'Dra. Mariana López',
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Dermatitis alérgica')).toBeInTheDocument();
    expect(screen.getByText('Rascado / Picazón')).toBeInTheDocument();
    expect(screen.getByText(/Antihistamínico y champú medicado/i)).toBeInTheDocument();
    expect(screen.getByText(/Dra. Mariana López/i)).toBeInTheDocument();
  });

  test('client cannot add, edit, or delete diagnoses (read-only mode)', () => {
    useAuthStore.setState({ user: { id: 'client-1', role: 'client' } });
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Candy', species: 'Cat', sex: 'Female' },
      isLoading: false,
      isError: false,
    });
    useDiagnosesList.mockReturnValue({
      data: [
        { id: 'diag-1', diagnosis: 'Otitis', status: 'Presuntivo' },
      ],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /agregar diagnóstico/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  test('veterinarian can open form, submit diagnosis, and navigate via Clinical Plan buttons', async () => {
    const user = userEvent.setup();
    useAuthStore.setState({ user: { id: 'vet-1', role: 'veterinarian', full_name: 'Dra. Mariana López' } });
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Candy', species: 'Cat', sex: 'Female' },
      isLoading: false,
      isError: false,
    });
    useDiagnosesList.mockReturnValue({ data: [], isLoading: false, isError: false });
    mockMutateAsync.mockResolvedValueOnce({ id: 'diag-99' });

    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole('button', { name: /agregar diagnóstico/i });
    await user.click(toggleButton);

    // Test Clinical Plan action buttons navigation
    const prescribeBtn = screen.getByRole('button', { name: /prescribir medicamento/i });
    await user.click(prescribeBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/client/medications?petId=pet-1');

    const assignAllergiesBtn = screen.getByRole('button', { name: /asignar alergias/i });
    await user.click(assignAllergiesBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/client/allergies?petId=pet-1');

    const followUpBtn = screen.getByRole('button', { name: /programar seguimiento/i });
    await user.click(followUpBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/client/appointments?petId=pet-1');

    // Fill required definitive diagnosis and submit
    const diagnosisInput = screen.getByLabelText(/diagnóstico definitivo \*/i);
    await user.type(diagnosisInput, 'Gastritis aguda');

    const submitBtn = screen.getByRole('button', { name: /completar consulta|guardar diagnóstico/i });
    await user.click(submitBtn);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      petId: 'pet-1',
      diagnosisData: expect.objectContaining({
        diagnosis: 'Gastritis aguda',
      }),
    });
  });

  test('language switching updates Diagnosis page UI text dynamically between Spanish and English', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Candy', species: 'Cat', sex: 'Female' },
      isLoading: false,
      isError: false,
    });
    useDiagnosesList.mockReturnValue({ data: [], isLoading: false, isError: false });

    const { rerender } = render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Diagnósticos').length).toBeGreaterThan(0);
    expect(screen.getByText('No hay diagnósticos disponibles.')).toBeInTheDocument();

    // Switch to English dynamically
    useLanguageStore.setState({ language: 'en' });
    rerender(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Diagnostics').length).toBeGreaterThan(0);
    expect(screen.getByText('No diagnoses available.')).toBeInTheDocument();
  });
});
