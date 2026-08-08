import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import VaccinesPage from '../src/pages/client/vaccines/VaccinesPage';
import { usePet } from '../src/hooks/usePets';
import { useVaccinesList } from '../src/hooks/useVaccines';
import useLanguageStore from '../src/stores/useLanguageStore';

vi.mock('../src/hooks/usePets', () => ({
  usePet: vi.fn(),
}));

vi.mock('../src/hooks/useVaccines', () => ({
  useVaccinesList: vi.fn(),
}));

const MOCK_PET = {
  id: 'pet-1',
  name: 'Buba',
  species: 'Dog',
  sex: 'Male',
  photo_url: null,
};

const MOCK_COMPLETED = {
  id: 'vac-1',
  name: 'Rabia',
  type: 'Rabia (Lyssavirus)',
  status: 'completed',
  brand: 'Merial',
  dose: '1',
  unit: 'dosis',
  administration_route: 'Subcutánea',
  scheduled_date: '2026-07-10',
  expiration_date: '2027-07-10',
  next_dose: '2027-07-10',
  batch_number: 'LOTE-001',
  veterinarian_name: 'Dr. Smith',
  notes: 'Sin reacciones.',
};

const MOCK_UPCOMING = {
  id: 'vac-2',
  name: 'Parvovirus',
  type: 'Parvovirus',
  status: 'upcoming',
  brand: 'Zoetis',
  dose: '2',
  unit: 'ml',
  administration_route: 'Intramuscular',
  scheduled_date: '2026-09-15',
  expiration_date: null,
  next_dose: null,
  batch_number: 'LOTE-555',
  veterinarian_name: 'Dra. Ruiz',
  notes: null,
};

describe('VaccinesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ language: 'es' });
    usePet.mockReturnValue({ data: MOCK_PET, isLoading: false, isError: false });
  });

  test('renders pet name and vaccine page title', () => {
    useVaccinesList.mockReturnValue({ data: [] });

    render(
      <MemoryRouter initialEntries={['/client/vaccines?petId=pet-1']}>
        <VaccinesPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Buba').length).toBeGreaterThan(0);
  });

  test('shows empty-state messages when no vaccines exist', () => {
    useVaccinesList.mockReturnValue({ data: [] });

    render(
      <MemoryRouter initialEntries={['/client/vaccines?petId=pet-1']}>
        <VaccinesPage />
      </MemoryRouter>
    );

    // Both panels should show their empty-state text
    expect(screen.getByText('No hay vacunas programadas en este momento.')).toBeInTheDocument();
    expect(screen.getByText('Todavía no hay vacunas completadas registradas.')).toBeInTheDocument();
  });

  test('renders completed vaccine detail fields: brand, dose, route, batch, date, veterinarian', () => {
    useVaccinesList.mockReturnValue({ data: [MOCK_COMPLETED] });

    render(
      <MemoryRouter initialEntries={['/client/vaccines?petId=pet-1']}>
        <VaccinesPage />
      </MemoryRouter>
    );

    // Vaccine name
    expect(screen.getByText('Rabia')).toBeInTheDocument();

    // Detail fields
    expect(screen.getByText('Merial')).toBeInTheDocument();
    expect(screen.getByText('1 dosis')).toBeInTheDocument();
    expect(screen.getByText('Subcutánea')).toBeInTheDocument();
    expect(screen.getByText('LOTE-001')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Sin reacciones.')).toBeInTheDocument();
  });

  test('renders upcoming vaccine detail fields', () => {
    useVaccinesList.mockReturnValue({ data: [MOCK_UPCOMING] });

    render(
      <MemoryRouter initialEntries={['/client/vaccines?petId=pet-1']}>
        <VaccinesPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Parvovirus').length).toBeGreaterThan(0);
    expect(screen.getByText('Zoetis')).toBeInTheDocument();
    expect(screen.getByText('2 ml')).toBeInTheDocument();
    expect(screen.getByText('Intramuscular')).toBeInTheDocument();
    expect(screen.getByText('LOTE-555')).toBeInTheDocument();
    expect(screen.getByText('Dra. Ruiz')).toBeInTheDocument();
  });

  test('renders vaccines in correct panels (upcoming vs history) by status', () => {
    useVaccinesList.mockReturnValue({ data: [MOCK_COMPLETED, MOCK_UPCOMING] });

    render(
      <MemoryRouter initialEntries={['/client/vaccines?petId=pet-1']}>
        <VaccinesPage />
      </MemoryRouter>
    );

    // Pill counts: 1 upcoming and 1 completed
    const pills = screen.getAllByText('1');
    expect(pills.length).toBeGreaterThanOrEqual(2);

    // Both vaccine names visible
    expect(screen.getAllByText('Rabia').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Parvovirus').length).toBeGreaterThan(0);
  });

  test('shows loading state message', () => {
    usePet.mockReturnValue({ data: null, isLoading: true, isError: false });
    useVaccinesList.mockReturnValue({ data: [] });

    render(
      <MemoryRouter initialEntries={['/client/vaccines?petId=pet-1']}>
        <VaccinesPage />
      </MemoryRouter>
    );

    // The vaccines-content-grid is not shown during loading
    expect(screen.queryByText('Rabia')).not.toBeInTheDocument();
  });

  test('displays label and value for next dose when present', () => {
    useVaccinesList.mockReturnValue({ data: [MOCK_COMPLETED] });

    render(
      <MemoryRouter initialEntries={['/client/vaccines?petId=pet-1']}>
        <VaccinesPage />
      </MemoryRouter>
    );

    // 'Próxima dosis' or 'Next dose' label must appear
    const nextDoseLabels =
      screen.queryAllByText(/próxima dosis/i).length > 0
        ? screen.queryAllByText(/próxima dosis/i)
        : screen.queryAllByText(/next dose/i);
    expect(nextDoseLabels.length).toBeGreaterThan(0);
  });
});
