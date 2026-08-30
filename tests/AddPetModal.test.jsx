import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import AddPetModal from '../src/components/modals/AddPetModal';
import { useCreatePet } from '../src/hooks/usePets';
import Swal from 'sweetalert2';

const mockCreatePet = vi.fn();

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

vi.mock('../src/hooks/usePets', () => ({
  useCreatePet: vi.fn(),
}));

describe('AddPetModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCreatePet.mockReturnValue({
      mutate: mockCreatePet,
      isPending: false,
    });
  });

  test('does not render modal when isOpen is false', () => {
    render(<AddPetModal isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders modal title, intro text, and PetForm when isOpen is true', () => {
    render(<AddPetModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(/registrar|register/i).length).toBeGreaterThan(0);
  });

  test('submits pet form data and handles onSuccess callback', async () => {
    const user = userEvent.setup();
    mockCreatePet.mockImplementation((payload, callbacks) => {
      callbacks.onSuccess();
    });

    render(<AddPetModal isOpen={true} onClose={mockOnClose} />);

    const nameInput = document.querySelector('#pet-name');
    const dateInput = document.querySelector('#pet-birth-date');
    const speciesSelect = document.querySelector('#pet-species');
    const sexSelect = document.querySelector('#pet-sex');
    const breedInput = document.querySelector('#pet-breed-primary');
    const weightInput = document.querySelector('#pet-weight');

    await user.type(nameInput, 'Max');
    await user.type(dateInput, '2024-01-01');
    await user.selectOptions(speciesSelect, 'Dog');
    await user.selectOptions(sexSelect, 'Male');
    await user.type(breedInput, 'Golden Retriever');
    await user.type(weightInput, '12.5');

    const submitBtn = screen.getByRole('button', { name: /save|guardar|registrar/i });
    await user.click(submitBtn);

    expect(mockCreatePet).toHaveBeenCalledWith(
      {
        name: 'Max',
        birth_date: '2024-01-01',
        species: 'Dog',
        sex: 'Male',
        breed_primary: 'Golden Retriever',
        breed_secondary: null,
        mixed_breed: false,
        weight_kg: 12.5,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        text: expect.stringContaining('Max'),
      })
    );
  });

  test('submits pet form data with secondary breed and handles onError callback', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Failed to create pet');
    mockCreatePet.mockImplementation((payload, callbacks) => {
      callbacks.onError(mockError);
    });

    render(<AddPetModal isOpen={true} onClose={mockOnClose} />);

    const nameInput = document.querySelector('#pet-name');
    const dateInput = document.querySelector('#pet-birth-date');
    const speciesSelect = document.querySelector('#pet-species');
    const sexSelect = document.querySelector('#pet-sex');
    const breedInput = document.querySelector('#pet-breed-primary');
    const weightInput = document.querySelector('#pet-weight');
    const mixedBreedCheckbox = document.querySelector('#pet-mixed-breed');

    await user.type(nameInput, 'Rocky');
    await user.type(dateInput, '2023-05-10');
    await user.selectOptions(speciesSelect, 'Dog');
    await user.selectOptions(sexSelect, 'Male');
    await user.type(breedInput, 'Boxer');
    await user.type(weightInput, '15.0');
    await user.click(mixedBreedCheckbox);

    const secondaryBreedInput = document.querySelector('#pet-breed-secondary');
    await user.type(secondaryBreedInput, 'Poodle');

    const submitBtn = screen.getByRole('button', { name: /save|guardar|registrar/i });
    await user.click(submitBtn);

    expect(mockCreatePet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rocky',
        mixed_breed: true,
        breed_secondary: 'Poodle',
      }),
      expect.any(Object)
    );

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  test('calls onClose when clicking cancel button inside form', async () => {
    const user = userEvent.setup();
    render(<AddPetModal isOpen={true} onClose={mockOnClose} />);

    const cancelBtn = screen.getByRole('button', { name: /cancel|cancelar/i });
    await user.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
