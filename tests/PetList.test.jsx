import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

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

    render(
      <MemoryRouter>
        <PetList />
      </MemoryRouter>,
    );

    expect(screen.getByText(/loading your pets/i)).toBeInTheDocument();
  });

  test('shows an empty state when there are no pets', () => {
    usePetsList.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter>
        <PetList />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/no pets registered/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /add first pet/i })).toBeInTheDocument();
  });

  test('shows pet health cards when pets exist', () => {
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

    render(
      <MemoryRouter>
        <PetList />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Candy').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /appointments/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vaccines/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lab results/i })).toBeInTheDocument();
  });

  test('opens a small pet profile panel when a pet is selected', async () => {
    const user = userEvent.setup();
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

    render(
      <MemoryRouter>
        <PetList />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /candy/i }));

    expect(screen.getByRole('dialog', { name: /candy profile summary/i })).toBeInTheDocument();
    expect(screen.getByText(/birth date/i)).toBeInTheDocument();
    expect(screen.getByText(/primary breed/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view full profile/i })).toHaveAttribute('href', '/client/pets/pet-1');
  });

  test('shows an error message when loading pets fails', () => {
    usePetsList.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(
      <MemoryRouter>
        <PetList />
      </MemoryRouter>,
    );

    expect(screen.getByText(/pet profiles could not be loaded/i)).toBeInTheDocument();
  });

  test('shows a permission message when the session role cannot load pets', () => {
    usePetsList.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: { response: { status: 403 } },
    });

    render(
      <MemoryRouter>
        <PetList />
      </MemoryRouter>,
    );

    expect(screen.getByText(/not authorized to load client pets/i)).toBeInTheDocument();
  });
});
