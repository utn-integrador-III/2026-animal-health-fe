import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CreateConsultation from '../src/pages/veterinarian/consultations/CreateConsultation';
import useLanguageStore from '../src/stores/useLanguageStore';

const findClient = vi.fn();
const createConsultation = vi.fn();
const createDiagnosis = vi.fn();

vi.mock('../src/hooks/useConsultations', () => ({
  useFindClientByEmail: vi.fn(() => ({
    mutateAsync: findClient,
    isPending: false,
  })),
  useCreateWalkInConsultation: vi.fn(() => ({
    mutateAsync: createConsultation,
    isPending: false,
  })),
  useCreateDiagnosis: vi.fn(() => ({
    mutateAsync: createDiagnosis,
    isPending: false,
  })),
}));

describe('CreateConsultation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useLanguageStore.setState({ language: 'es' });
  });

  test('searches an existing client and creates a walk-in consultation for an existing pet', async () => {
    const user = userEvent.setup();
    findClient.mockResolvedValueOnce({
      client: {
        id: 'client-1',
        full_name: 'Abby Ramirez',
        email: 'abby@example.com',
        phone: '8875-4545',
      },
      pets: [
        {
          id: 'pet-1',
          name: 'Lola',
          birth_date: '2024-07-13',
          species: 'Bird',
          sex: 'Female',
          breed_primary: 'Ninfa',
          weight_kg: 0.085,
        },
      ],
    });
    createConsultation.mockResolvedValueOnce({
      id: 'consultation-1',
      pet_id: 'pet-1',
      pet_name: 'Lola',
      owner_name: 'Abby Ramirez',
      reason: 'Consulta presencial por caida de plumas',
    });

    render(<CreateConsultation />);

    await user.type(screen.getByLabelText(/correo del cliente/i), 'abby@example.com');
    await user.click(screen.getByRole('button', { name: /buscar cliente/i }));
    await user.selectOptions(await screen.findByLabelText(/mascota registrada/i), 'pet-1');
    await user.type(screen.getByLabelText(/motivo de la visita/i), 'Consulta presencial por caida de plumas');
    await user.click(screen.getByRole('button', { name: /crear consulta/i }));

    expect(findClient).toHaveBeenCalledWith('abby@example.com');
    expect(createConsultation).toHaveBeenCalledWith(expect.objectContaining({
      client_id: 'client-1',
      client_email: 'abby@example.com',
      pet_id: 'pet-1',
      pet_name: 'Lola',
      pet_weight_kg: 0.085,
      reason: 'Consulta presencial por caida de plumas',
    }));
    expect(await screen.findByText(/consulta externa creada/i)).toBeInTheDocument();
  });

  test('saves a diagnosis after creating the walk-in consultation', async () => {
    const user = userEvent.setup();
    createConsultation.mockResolvedValueOnce({
      id: 'consultation-1',
      pet_id: 'pet-2',
      pet_name: 'Milo',
      owner_name: 'Samuel Romero',
      reason: 'Revision externa',
    });
    createDiagnosis.mockResolvedValueOnce({
      id: 'diagnosis-1',
      consultation_id: 'consultation-1',
      pet_id: 'pet-2',
      diagnosis: 'Dermatitis',
      clinical_notes: 'Se observa irritacion leve.',
    });

    render(<CreateConsultation />);

    await user.type(screen.getByLabelText(/correo del cliente/i), 'samuel@example.com');
    await user.type(screen.getByLabelText(/nombre completo/i), 'Samuel Romero');
    await user.type(screen.getByLabelText(/nombre de la mascota/i), 'Milo');
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2024-03-01');
    await user.selectOptions(screen.getByLabelText(/especie/i), 'Dog');
    await user.selectOptions(screen.getByLabelText(/sexo/i), 'Male');
    await user.type(screen.getByLabelText(/raza principal/i), 'Mestizo');
    await user.type(screen.getByLabelText(/peso/i), '12.5');
    await user.type(screen.getByLabelText(/motivo de la visita/i), 'Revision externa');
    await user.click(screen.getByRole('button', { name: /crear consulta/i }));

    await user.type(await screen.findByLabelText(/diagn.stico/i), 'Dermatitis');
    await user.type(screen.getByLabelText(/notas clinicas/i), 'Se observa irritacion leve.');
    await user.click(screen.getByRole('button', { name: /guardar diagnostico/i }));

    expect(createDiagnosis).toHaveBeenCalledWith({
      consultationId: 'consultation-1',
      diagnosisData: {
        consultation_id: 'consultation-1',
        pet_id: 'pet-2',
        diagnosis: 'Dermatitis',
        clinical_notes: 'Se observa irritacion leve.',
      },
    });
    expect(await screen.findByText(/diagnostico guardado/i)).toBeInTheDocument();
  });
});
