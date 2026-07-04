import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import PetForm from '../src/components/forms/PetForm';

async function fillValidPetForm(user) {
  await user.type(screen.getByLabelText(/pet name/i), 'Luna');
  await user.type(screen.getByLabelText(/date of birth/i), '2024-01-01');
  await user.selectOptions(screen.getByLabelText(/species/i), 'Dog');
  await user.selectOptions(screen.getByLabelText(/^sex/i), 'Female');
  await user.type(screen.getByLabelText(/primary breed/i), 'Mixed');
  await user.type(screen.getByLabelText(/weight/i), '8.5');
}

describe('PetForm', () => {
  test('renders the required fields', () => {
    render(<PetForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/pet name/i)).toBeRequired();
    expect(screen.getByLabelText(/date of birth/i)).toBeRequired();
    expect(screen.getByLabelText(/species/i)).toBeRequired();
    expect(screen.getByLabelText(/^sex/i)).toBeRequired();
    expect(screen.getByLabelText(/primary breed/i)).toBeRequired();
    expect(screen.getByLabelText(/weight/i)).toBeRequired();
  });

  test('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    render(<PetForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /save pet/i }));

    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a species/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a sex/i)).toBeInTheDocument();
    expect(screen.getByText(/breed must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/weight is required/i)).toBeInTheDocument();
  });

  test('submits valid pet data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PetForm onSubmit={onSubmit} />);

    await fillValidPetForm(user);
    await user.click(screen.getByRole('button', { name: /save pet/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Luna',
        birth_date: '2024-01-01',
        species: 'Dog',
        sex: 'Female',
        breed_primary: 'Mixed',
        weight_kg: 8.5,
      }), expect.anything());
    });
  });

  test('shows secondary breed field when mixed breed is checked', async () => {
    const user = userEvent.setup();
    render(<PetForm onSubmit={vi.fn()} />);

    expect(screen.queryByRole('textbox', { name: /secondary breed/i })).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/mixed breed/i));

    expect(screen.getByRole('textbox', { name: /secondary breed/i })).toBeRequired();
  });
});
