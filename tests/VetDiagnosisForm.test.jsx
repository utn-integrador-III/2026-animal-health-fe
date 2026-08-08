import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { INITIAL_FORM } from '../src/components/veterinarian/VetDiagnosisForm';
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
  default: { fire: vi.fn() },
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

// ─── INITIAL_FORM defaults ────────────────────────────────────────────────────

describe('INITIAL_FORM defaults', () => {
  test('vital sign fields start empty (no pre-filled numbers)', () => {
    expect(INITIAL_FORM.temperature_c).toBe('');
    expect(INITIAL_FORM.heart_rate_bpm).toBe('');
    expect(INITIAL_FORM.respiratory_rate_rpm).toBe('');
    expect(INITIAL_FORM.capillary_refill_sec).toBe('');
    expect(INITIAL_FORM.duration).toBe('');
  });

  test('clinical evaluation fields start empty (no pre-filled example diagnosis)', () => {
    expect(INITIAL_FORM.presumptive_diagnosis).toBe('');
    expect(INITIAL_FORM.differential_diagnoses).toBe('');
  });

  test('all owner_symptoms checkboxes default to false', () => {
    const vals = Object.values(INITIAL_FORM.owner_symptoms).filter(
      (v) => typeof v === 'boolean'
    );
    expect(vals.every((v) => v === false)).toBe(true);
  });

  test('all vet_signs checkboxes default to false', () => {
    const vals = Object.values(INITIAL_FORM.vet_signs).filter(
      (v) => typeof v === 'boolean'
    );
    expect(vals.every((v) => v === false)).toBe(true);
  });

  test('all recommended_actions checkboxes default to false', () => {
    const vals = Object.values(INITIAL_FORM.recommended_actions);
    expect(vals.every((v) => v === false)).toBe(true);
  });

  test('requires_follow_up defaults to false', () => {
    expect(INITIAL_FORM.requires_follow_up).toBe(false);
  });
});

// ─── VetDiagnosisForm placeholders in DiagnosisPage ────────────────────────

describe('VetDiagnosisForm placeholder behaviour (via DiagnosisPage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ language: 'es' });
    useAuthStore.setState({
      user: { id: 'vet-1', role: 'veterinarian', full_name: 'Dra. Ruiz' },
    });
    usePet.mockReturnValue({
      data: { id: 'pet-1', name: 'Buba', species: 'Dog', sex: 'Male' },
      isLoading: false,
      isError: false,
    });
    useDiagnosesList.mockReturnValue({ data: [], isLoading: false, isError: false });
  });

  async function openForm(user) {
    const { default: userEvent } = await import('@testing-library/user-event');
    const evt = user ?? userEvent.setup();
    const btn = screen.getByRole('button', { name: /agregar diagnóstico/i });
    await evt.click(btn);
    return evt;
  }

  test('reason textarea has gray placeholder text visible when empty', async () => {
    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    await openForm();

    const textarea = screen.getByPlaceholderText(
      /describe el motivo principal de la consulta/i
    );
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('');
  });

  test('temperature input has placeholder text visible when empty', async () => {
    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    await openForm();

    // Scroll to exam section
    const tempInput = screen.getByPlaceholderText(/ej\. 38\.5/i);
    expect(tempInput).toBeInTheDocument();
    expect(tempInput.value).toBe('');
  });

  test('presumptive diagnosis input has placeholder text visible when empty', async () => {
    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    await openForm();

    const input = screen.getByPlaceholderText(/ej\. dermatitis alérgica/i);
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  test('switching language to English shows English placeholder text', async () => {
    useLanguageStore.setState({ language: 'en' });

    render(
      <MemoryRouter initialEntries={['/client/diagnostics?petId=pet-1']}>
        <DiagnosisPage />
      </MemoryRouter>
    );

    // When language is English the button renders as 'Add Diagnosis'
    const { default: userEvent } = await import('@testing-library/user-event');
    const evt = userEvent.setup();
    const btn = screen.getByRole('button', { name: /add diagnosis/i });
    await evt.click(btn);

    const textarea = screen.getByPlaceholderText(
      /describe the main reason for the consultation/i
    );
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('');
  });

});
