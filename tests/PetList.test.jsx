import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import PetList from '../src/pages/client/pets/PetList';
import { usePetsList } from '../src/hooks/usePets';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

vi.mock('../src/hooks/usePets', () => ({
  usePetsList: vi.fn(),
  useCreatePet: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

describe('PetList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows a loader while pets are loading', () => {
    usePetsList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<PetList />);

    expect(screen.getByText(/loading your pets/i)).toBeInTheDocument();
  });

  test('shows an empty state when there are no pets', () => {
    usePetsList.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<PetList />);

    expect(screen.getByText(/no pets registered/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add first pet/i })).toBeInTheDocument();
  });

  test('shows pet cards when pets exist', () => {
    usePetsList.mockReturnValue({
      data: [
        {
          id: 'pet-1',
          name: 'Candy',
          species: 'Dog',
          sex: 'Female',
          breed_primary: 'Beagle',
          breed_secondary: null,
          weight_kg: 8.5,
          birth_date: '2022-05-10',
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<PetList />);

    expect(screen.getByText('Candy')).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText(/8.5 kg/i)).toBeInTheDocument();
  });

  test('shows an error message when loading pets fails', () => {
    usePetsList.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<PetList />);

    expect(screen.getByText(/pet profiles could not be loaded/i)).toBeInTheDocument();
  });
});
