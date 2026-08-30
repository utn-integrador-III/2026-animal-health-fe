import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import LabResultsPage from '../src/pages/client/laboratory/LabResultsPage';
import { usePet } from '../src/hooks/usePets';
import { useLabResultsList } from '../src/hooks/useLabResults';
import useLanguageStore from '../src/stores/useLanguageStore';

vi.mock('../src/hooks/usePets', () => ({
  usePet: vi.fn(),
  usePetsList: vi.fn(() => ({ data: [] })),
}));

vi.mock('../src/hooks/useLabResults', () => ({
  useLabResultsList: vi.fn(),
}));

describe('LabResultsPage (Client View)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ language: 'es' });
  });

  test('shows empty state when pet has no registered lab exams', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Max', species: 'Dog', sex: 'Male' },
      isLoading: false,
      isError: false,
    });
    useLabResultsList.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(
      <MemoryRouter initialEntries={['/client/lab-results?petId=pet-1']}>
        <LabResultsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/no hay solicitudes ni resultados de laboratorio/i)).toBeInTheDocument();
    expect(screen.getAllByText('Max').length).toBeGreaterThan(0);
  });

  test('displays pending notification when veterinarian has not uploaded results yet', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Max', species: 'Dog', sex: 'Male' },
      isLoading: false,
      isError: false,
    });
    useLabResultsList.mockReturnValue({
      data: [
        {
          id: 'lab-1',
          test_type: 'Hemograma',
          priority: 'Urgente',
          status: 'Solicitado',
          reason: 'Fiebre y decaimiento',
          clinical_observations: 'Temperatura 39.8C',
          requested_at: '2026-08-27',
          veterinarian_name: 'Dra. María Sánchez',
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={['/client/lab-results?petId=pet-1']}>
        <LabResultsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Hemograma')).toBeInTheDocument();
    expect(screen.getByText(/urgente/i)).toBeInTheDocument();
    expect(screen.getByText(/resultado pendiente\. el veterinario aún no ha subido el archivo\./i)).toBeInTheDocument();
    expect(screen.getByText(/fiebre y decaimiento/i)).toBeInTheDocument();
    expect(screen.getByText('Dra. María Sánchez')).toBeInTheDocument();
  });

  test('displays summary, recommendations, and view/download buttons when result is available', () => {
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Max', species: 'Dog', sex: 'Male' },
      isLoading: false,
      isError: false,
    });
    useLabResultsList.mockReturnValue({
      data: [
        {
          id: 'lab-2',
          test_type: 'Química sanguínea',
          priority: 'Normal',
          status: 'Resultado disponible',
          reason: 'Control anual',
          result_date: '2026-08-28',
          file_url: 'https://storage.googleapis.com/test-bucket/lab_results/quimica.pdf',
          file_name: 'quimica.pdf',
          summary: 'Glucosa y enzimas hepáticas dentro de los rangos normales.',
          observations: 'Parámetros renales y hepáticos óptimos.',
          recommendation: 'Mantener dieta balanceada y control en 12 meses.',
          veterinarian_name: 'Dr. Roberto Gomez',
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter initialEntries={['/client/lab-results?petId=pet-1']}>
        <LabResultsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Química sanguínea')).toBeInTheDocument();
    expect(screen.getAllByText(/resultado disponible/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/glucosa y enzimas hepáticas/i)).toBeInTheDocument();
    expect(screen.getByText(/parámetros renales y hepáticos óptimos/i)).toBeInTheDocument();
    expect(screen.getByText(/mantener dieta balanceada/i)).toBeInTheDocument();

    const viewBtn = screen.getByRole('link', { name: /ver resultado/i });
    expect(viewBtn).toHaveAttribute('href', 'https://storage.googleapis.com/test-bucket/lab_results/quimica.pdf');

    const downloadBtn = screen.getByRole('link', { name: /descargar pdf/i });
    expect(downloadBtn).toHaveAttribute('href', 'https://storage.googleapis.com/test-bucket/lab_results/quimica.pdf');
  });
});
