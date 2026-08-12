import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import DiagnosisSummaryCard from '../src/components/cards/DiagnosisSummaryCard';
import useLanguageStore from '../src/stores/useLanguageStore';

const MOCK_DIAGNOSIS = {
  id: 'diag-1',
  diagnosis: 'Intoxicación',
  status: 'Confirmado',
  consultation_date: '2026-08-06',
  veterinarian_name: 'María Sánchez',
  reason: 'Pérdida de apetito, Vómitos, Diarrea',
  weight_kg: '8',
  temperature_c: '38.5',
  heart_rate_bpm: '120',
  respiratory_rate_rpm: '28',
  systems_eval: {
    digestive: { status: 'Anormal' },
    generalState: { status: 'Normal' },
  },
  treatment: 'Control de seguimiento',
  follow_up_date: '2026-08-10',
  follow_up_reason: 'Control',
};

describe('DiagnosisSummaryCard', () => {
  test('renders diagnosis header, vitals, systems evaluation, and treatment plan correctly', () => {
    useLanguageStore.setState({ language: 'es' });
    render(<DiagnosisSummaryCard item={MOCK_DIAGNOSIS} />);

    // Header
    expect(screen.getByText('Intoxicación')).toBeInTheDocument();
    expect(screen.getByText(/María Sánchez/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmado/i)).toBeInTheDocument();

    // Motivo principal tags
    expect(screen.getByText('Pérdida de apetito')).toBeInTheDocument();
    expect(screen.getByText('Vómitos')).toBeInTheDocument();
    expect(screen.getByText('Diarrea')).toBeInTheDocument();

    // Signos vitales
    expect(screen.getByText('8 kg')).toBeInTheDocument();
    expect(screen.getByText('38.5°C')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();

    // Systems evaluation
    expect(screen.getByText('Sistema digestivo')).toBeInTheDocument();
    expect(screen.getByText('Anormal')).toBeInTheDocument();
    expect(screen.getByText('Estado general')).toBeInTheDocument();

    // Resumen del tratamiento / plan
    expect(screen.getByText(/Control de seguimiento/i)).toBeInTheDocument();
    expect(screen.getByText(/motivo: Control/i)).toBeInTheDocument();
  });
});
