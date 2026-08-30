import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import VetDiagnosisForm, { INITIAL_FORM } from '../src/components/veterinarian/VetDiagnosisForm';
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

// ─── VetDiagnosisForm direct component interactions ─────────────────────────

describe('VetDiagnosisForm direct component interactions', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ language: 'es' });
  });

  test('shows warning alert when submitting without definitive diagnosis', async () => {
    const Swal = (await import('sweetalert2')).default;
    const { container } = render(
      <MemoryRouter>
        <VetDiagnosisForm onSubmit={mockOnSubmit} />
      </MemoryRouter>
    );

    const formElement = container.querySelector('form');
    fireEvent.submit(formElement);

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'warning',
      })
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('submits form payload with full symptoms, system evaluation, and follow-up data', async () => {
    const user = userEvent.setup();
    const pet = { id: 'pet-77', name: 'Max', weight_kg: 8.5 };
    const vet = { full_name: 'Dr. Alejandro Soto' };

    render(
      <MemoryRouter>
        <VetDiagnosisForm
          pet={pet}
          veterinarian={vet}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </MemoryRouter>
    );

    // Fill definitive diagnosis
    const diagnosisInput = screen.getByLabelText(/diagnóstico definitivo \*/i);
    await user.type(diagnosisInput, 'Gastritis bacteriana');

    // Fill reason, duration, temperature, heart rate, etc.
    const reasonTextarea = screen.getByPlaceholderText(/describe el motivo principal/i);
    await user.type(reasonTextarea, 'Vómitos frecuentes');

    const durationInput = screen.getByPlaceholderText(/ej\. 5 días/i);
    await user.type(durationInput, '3 días');

    const tempInput = screen.getByPlaceholderText(/ej\. 38\.5/i);
    await user.type(tempInput, '39.1');

    // Check symptoms and signs
    const appetiteLossCheckbox = screen.getByLabelText(/Pérdida de apetito/i);
    await user.click(appetiteLossCheckbox);

    const feverCheckbox = screen.getByLabelText(/Fiebre/i);
    await user.click(feverCheckbox);

    // Toggle follow-up
    const followUpToggle = screen.getByRole('button', { name: 'No' });
    await user.click(followUpToggle);

    // Fill follow-up reason
    const followUpReasonTextarea = screen.getByLabelText(/motivo del seguimiento/i);
    await user.type(followUpReasonTextarea, 'Revisar evolución de síntomas');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /completar consulta/i });
    await user.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        pet_id: 'pet-77',
        diagnosis: 'Gastritis bacteriana',
        reason: 'Vómitos frecuentes',
        temperature_c: '39.1',
        weight_kg: '8.5',
        symptoms: expect.stringContaining('Pérdida de apetito'),
      })
    );
  });

  test('navigates to clinical sections via action buttons with or without onNavigateToSection callback', async () => {
    const user = userEvent.setup();
    const pet = { id: 'pet-77' };

    // With onNavigateToSection callback
    const { rerender } = render(
      <MemoryRouter>
        <VetDiagnosisForm
          pet={pet}
          onNavigateToSection={mockOnNavigate}
        />
      </MemoryRouter>
    );

    const prescribeBtn = screen.getByRole('button', { name: /prescribir medicamento/i });
    await user.click(prescribeBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith('medications');

    const allergiesBtn = screen.getByRole('button', { name: /asignar alergias/i });
    await user.click(allergiesBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith('allergies');

    const followUpBtn = screen.getByRole('button', { name: /programar seguimiento/i });
    await user.click(followUpBtn);
    expect(mockOnNavigate).toHaveBeenCalledWith('appointments');

    // Without onNavigateToSection callback (uses navigate fallback)
    rerender(
      <MemoryRouter>
        <VetDiagnosisForm pet={pet} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /prescribir medicamento/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/client/medications?petId=pet-77');

    await user.click(screen.getByRole('button', { name: /asignar alergias/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/client/allergies?petId=pet-77');

    await user.click(screen.getByRole('button', { name: /programar seguimiento/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/client/appointments?petId=pet-77');
  });

  test('handles navigate fallback when pet is null or has no id', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <VetDiagnosisForm pet={null} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /prescribir medicamento/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/client/medications');

    await user.click(screen.getByRole('button', { name: /asignar alergias/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/client/allergies');

    await user.click(screen.getByRole('button', { name: /programar seguimiento/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/client/appointments');
  });

  test('calls onCancel prop when clicking cancel button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <VetDiagnosisForm onCancel={mockOnCancel} />
      </MemoryRouter>
    );

    const cancelBtn = screen.getByRole('button', { name: /^cancelar$/i });
    await user.click(cancelBtn);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('supports controlled diagnosisForm and setDiagnosisForm state props', async () => {
    const mockSetDiagnosisForm = vi.fn((updater) => {
      if (typeof updater === 'function') {
        updater(INITIAL_FORM);
      }
    });

    render(
      <MemoryRouter>
        <VetDiagnosisForm
          diagnosisForm={INITIAL_FORM}
          setDiagnosisForm={mockSetDiagnosisForm}
        />
      </MemoryRouter>
    );

    const diagnosisInput = screen.getByLabelText(/diagnóstico definitivo \*/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Otitis externa' } });

    expect(mockSetDiagnosisForm).toHaveBeenCalled();
  });

  test('shows pending state on submit button when isPending is true', () => {
    render(
      <MemoryRouter>
        <VetDiagnosisForm isPending={true} />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: '...' });
    expect(submitBtn).toBeDisabled();
  });

  test('updates recommended_actions, treatment, instructions, warning signs, follow-up date, and notes inputs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <VetDiagnosisForm />
      </MemoryRouter>
    );

    // Recommended action checkbox
    const prescribeActionCheckbox = screen.getByLabelText(/Prescribir medicamento/i);
    await user.click(prescribeActionCheckbox);
    expect(prescribeActionCheckbox).toBeChecked();

    // Treatment textarea
    const treatmentTextarea = screen.getByPlaceholderText(/describe el tratamiento/i);
    await user.type(treatmentTextarea, 'Amoxicilina 250mg cada 12 horas por 7 días');
    expect(treatmentTextarea.value).toBe('Amoxicilina 250mg cada 12 horas por 7 días');

    // Owner instructions textarea
    const instructionsTextarea = screen.getByLabelText(/indicaciones|instructions/i);
    await user.type(instructionsTextarea, 'Administrar con comida');
    expect(instructionsTextarea.value).toBe('Administrar con comida');

    // Warning signs textarea
    const warningSignsTextarea = screen.getByLabelText(/signos de alarma|warning signs/i);
    await user.type(warningSignsTextarea, 'Vómitos continuos');
    expect(warningSignsTextarea.value).toBe('Vómitos continuos');

    // Enable follow-up & fill date
    const followUpToggle = screen.getByRole('button', { name: 'No' });
    await user.click(followUpToggle);

    const followUpDateInput = screen.getByLabelText(/fecha de seguimiento/i);
    fireEvent.change(followUpDateInput, { target: { value: '2026-09-01' } });
    expect(followUpDateInput.value).toBe('2026-09-01');

    // Notes textarea
    const notesTextarea = screen.getByPlaceholderText(/observaciones clínicas adicionales/i);
    await user.type(notesTextarea, 'Paciente colaboradores');
    expect(notesTextarea.value).toBe('Paciente colaboradores');
  });

  test('updates system evaluation status and observation, presumptive/differential diagnoses, and status select', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <VetDiagnosisForm />
      </MemoryRouter>
    );

    // System evaluation status select & observation input
    const systemSelects = screen.getAllByRole('combobox').filter((select) =>
      Array.from(select.options).some((option) => option.value === 'No evaluado')
    );
    fireEvent.change(systemSelects[0], { target: { value: 'Anormal' } });
    expect(systemSelects[0].value).toBe('Anormal');

    const obsInputs = screen.getAllByPlaceholderText('Sin anomalías / Observación');
    fireEvent.change(obsInputs[0], { target: { value: 'Eritema moderado' } });
    expect(obsInputs[0].value).toBe('Eritema moderado');

    // Presumptive diagnosis input
    const presumptiveInput = screen.getByLabelText(/diagnóstico presuntivo/i);
    await user.type(presumptiveInput, 'Presunción de sarna');
    expect(presumptiveInput.value).toBe('Presunción de sarna');

    // Differential diagnoses input
    const differentialInput = screen.getByLabelText(/diagnósticos diferenciales/i);
    await user.type(differentialInput, 'Infección fúngica');
    expect(differentialInput.value).toBe('Infección fúngica');

    // Status select
    const statusSelect = screen.getByDisplayValue(/Presuntivo/i);
    fireEvent.change(statusSelect, { target: { value: 'Confirmado' } });
    expect(statusSelect.value).toBe('Confirmado');
  });

  test('updates remaining consultation info, vitals, exam, evolution, and severity inputs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <VetDiagnosisForm />
      </MemoryRouter>
    );

    // Consultation Date & Time
    const dateInput = screen.getByLabelText(/fecha de consulta/i);
    fireEvent.change(dateInput, { target: { value: '2026-08-25' } });
    expect(dateInput.value).toBe('2026-08-25');

    const timeInput = screen.getByLabelText(/hora/i);
    fireEvent.change(timeInput, { target: { value: '14:30' } });
    expect(timeInput.value).toBe('14:30');

    // Appointment ref & Consultation type
    const refInput = screen.getByPlaceholderText('APT-1005');
    await user.type(refInput, 'APT-9999');
    expect(refInput.value).toBe('APT-9999');

    const consultTypeSelect = screen.getByLabelText(/tipo de consulta/i);
    fireEvent.change(consultTypeSelect, { target: { value: 'Urgencia' } });
    expect(consultTypeSelect.value).toBe('Urgencia');

    // Symptom start date, Evolution, Severity
    const startDateInput = screen.getByLabelText(/inicio de síntomas/i);
    fireEvent.change(startDateInput, { target: { value: '2026-08-20' } });
    expect(startDateInput.value).toBe('2026-08-20');

    const evolutionSelect = screen.getByLabelText(/evolución/i);
    fireEvent.change(evolutionSelect, { target: { value: 'Mejorando' } });
    expect(evolutionSelect.value).toBe('Mejorando');

    const severityRadio = screen.getByLabelText('Severa');
    await user.click(severityRadio);
    expect(severityRadio).toBeChecked();

    // Vitals: Weight, Heart rate, Respiratory rate, Body condition, Hydration
    const weightInput = screen.getByLabelText(/peso \(kg\)/i);
    fireEvent.change(weightInput, { target: { value: '12.4' } });
    expect(weightInput.value).toBe('12.4');

    const heartRateInput = screen.getByLabelText(/frecuencia cardíaca/i);
    await user.type(heartRateInput, '110');
    expect(heartRateInput.value).toBe('110');

    const respRateInput = screen.getByLabelText(/frecuencia respiratoria/i);
    await user.type(respRateInput, '28');
    expect(respRateInput.value).toBe('28');

    const bodyCondSelect = screen.getByLabelText(/condición corporal/i);
    fireEvent.change(bodyCondSelect, { target: { value: '7 - Sobrepeso' } });
    expect(bodyCondSelect.value).toBe('7 - Sobrepeso');

    const hydrationSelect = screen.getByRole('combobox', { name: /^hidratación$/i });
    fireEvent.change(hydrationSelect, { target: { value: 'Deshidratado 5-8%' } });
    expect(hydrationSelect.value).toBe('Deshidratado 5-8%');
  });
});
