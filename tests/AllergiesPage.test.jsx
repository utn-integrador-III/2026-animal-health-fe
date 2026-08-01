import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import AllergiesPage from '../src/pages/client/allergies/AllergiesPage';
import { usePet } from '../src/hooks/usePets';
import { useAllergiesList, useAddAllergy } from '../src/hooks/useAllergies';
import useLanguageStore from '../src/stores/useLanguageStore';

const mockMutateAsync = vi.fn();

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

vi.mock('../src/hooks/usePets', () => ({
  usePet: vi.fn(),
}));

vi.mock('../src/hooks/useAllergies', () => ({
  useAllergiesList: vi.fn(),
  useAddAllergy: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  })),
}));

describe('AllergiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ language: 'es' });
  });

  test('shows loading message when pet or allergies are loading', () => {
    usePet.mockReturnValue({ data: null, isLoading: true, isError: false });
    useAllergiesList.mockReturnValue({ data: [], isLoading: true, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/allergies?petId=pet-1']}>
        <AllergiesPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando alergias/i)).toBeInTheDocument();
  });

  test('shows empty state when pet has no registered allergies', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Firulais', species: 'Dog', sex: 'Male' },
      isLoading: false,
      isError: false,
    });
    useAllergiesList.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/allergies?petId=pet-1']}>
        <AllergiesPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/no se han registrado alergias/i)).toBeInTheDocument();
    expect(screen.getAllByText('Firulais').length).toBeGreaterThan(0);
  });

  test('renders list of registered allergies correctly', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Firulais', species: 'Dog', sex: 'Male' },
      isLoading: false,
      isError: false,
    });
    useAllergiesList.mockReturnValue({
      data: [
        {
          id: 'allergy-1',
          allergen: 'Polen',
          category: 'environmental',
          severity: 'mild',
          reaction: 'Estornudos',
          notes: 'Observar durante la primavera',
          created_at: '2026-07-20',
          veterinarian_name: 'Dr. Perez',
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={['/client/allergies?petId=pet-1']}>
        <AllergiesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Polen')).toBeInTheDocument();
    expect(screen.getByText(/estornudos/i)).toBeInTheDocument();
    expect(screen.getByText(/observar durante la primavera/i)).toBeInTheDocument();
  });

  test('toggles and submits new allergy form', async () => {
    const user = userEvent.setup();
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Firulais', species: 'Dog', sex: 'Male' },
      isLoading: false,
      isError: false,
    });
    useAllergiesList.mockReturnValue({ data: [], isLoading: false, isError: false });
    mockMutateAsync.mockResolvedValueOnce({ id: 'allergy-2' });

    render(
      <MemoryRouter initialEntries={['/client/allergies?petId=pet-1']}>
        <AllergiesPage />
      </MemoryRouter>
    );

    // Open add allergy form
    const toggleButton = screen.getByRole('button', { name: /registrar alergia/i });
    await user.click(toggleButton);

    // Fill form fields
    const allergenInput = screen.getByLabelText(/alérgeno \*/i);
    const categorySelect = screen.getByLabelText(/categoría \*/i);
    const severitySelect = screen.getByLabelText(/severidad \*/i);
    const reactionInput = screen.getByLabelText(/reacción/i);
    const notesInput = screen.getByLabelText(/notas/i);

    await user.type(allergenInput, 'Pollo');
    await user.selectOptions(categorySelect, 'food');
    await user.selectOptions(severitySelect, 'severe');
    await user.type(reactionInput, 'Vómitos');
    await user.type(notesInput, 'Dieta hipoalergénica recomendada');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /^registrar alergia$/i });
    await user.click(submitBtn);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      petId: 'pet-1',
      allergyData: {
        allergen: 'Pollo',
        category: 'food',
        severity: 'severe',
        reaction: 'Vómitos',
        notes: 'Dieta hipoalergénica recomendada',
      },
    });
  });
});
