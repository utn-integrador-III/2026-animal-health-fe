import { fireEvent, render, screen } from '@testing-library/react';
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

  test('shows error message when loading pet or allergies fails', () => {
    usePet.mockReturnValue({ data: null, isLoading: false, isError: true });
    useAllergiesList.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/allergies?petId=pet-1']}>
        <AllergiesPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/no se pudieron cargar las alergias/i)).toBeInTheDocument();
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

  test('validates form fields and handles submission errors', async () => {
    const Swal = (await import('sweetalert2')).default;
    const user = userEvent.setup();
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

    // Open form
    await user.click(screen.getByRole('button', { name: /registrar alergia/i }));

    const formElement = screen.getByRole('button', { name: /^registrar alergia$/i }).closest('form');

    // 1) Submit with empty allergen
    fireEvent.submit(formElement);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));

    // Fill allergen
    const allergenInput = screen.getByLabelText(/alérgeno \*/i);
    await user.type(allergenInput, 'Polen');

    // 2) Submit with empty category
    fireEvent.submit(formElement);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));

    // Select category
    const categorySelect = screen.getByLabelText(/categoría \*/i);
    await user.selectOptions(categorySelect, 'environmental');

    // 3) Submit with empty severity
    fireEvent.submit(formElement);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));

    // Select severity
    const severitySelect = screen.getByLabelText(/severidad \*/i);
    await user.selectOptions(severitySelect, 'mild');

    // 4) Submit with mutation failure
    mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));
    fireEvent.submit(formElement);

    await vi.waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
    });
  });

  test('cancels form edit when clicking secondary cancel button', async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByRole('button', { name: /registrar alergia/i }));
    const cancelButtons = screen.getAllByRole('button', { name: /cancelar/i });
    expect(cancelButtons.length).toBeGreaterThan(0);

    await user.click(cancelButtons[cancelButtons.length - 1]);
    expect(screen.queryByRole('button', { name: /^cancelar$/i })).not.toBeInTheDocument();
  });

  test('renders pet with photo_url and handles date formatting edge cases & fallbacks', () => {
    usePet.mockReturnValue({
      data: {
        id: 'pet-1',
        name: 'Firulais',
        species: 'Dog',
        sex: 'Male',
        photo_url: 'https://example.com/firulais.jpg',
      },
      isLoading: false,
      isError: false,
    });
    useAllergiesList.mockReturnValue({
      data: [
        {
          id: 'allergy-1',
          allergen: 'Manzana',
          category: 'food',
          severity: 'unknown_severity',
          created_at: 'invalid-date-string',
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={['/client/allergies']}>
        <AllergiesPage />
      </MemoryRouter>
    );

    const img = screen.getByAltText('Firulais');
    expect(img).toHaveAttribute('src', 'https://example.com/firulais.jpg');
    expect(screen.getByText('Manzana')).toBeInTheDocument();
    expect(screen.getByText(/invalid-date-string/)).toBeInTheDocument();
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink).toHaveAttribute('href', '/client/dashboard');
  });

  test('shows pending state when adding allergy is in progress', () => {
    useAddAllergy.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Firulais' },
      isLoading: false,
      isError: false,
    });
    useAllergiesList.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/allergies?petId=pet-1']}>
        <AllergiesPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /registrar alergia/i }));

    const submitBtn = screen.getByRole('button', { name: '...' });
    expect(submitBtn).toBeDisabled();

    useAddAllergy.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });
});

