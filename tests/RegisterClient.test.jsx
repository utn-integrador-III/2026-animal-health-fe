import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import RegisterClient from '../src/pages/auth/RegisterClient';
import useAuthStore from '../src/stores/useAuthStore';
import { registerUser } from '../src/services/authService';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  },
}));

vi.mock('../src/services/authService', () => ({
  registerUser: vi.fn(),
}));

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/auth/register']}>
      <Routes>
        <Route path="/auth/register" element={<RegisterClient />} />
        <Route path="/client/pets" element={<h1>Client pets</h1>} />
        <Route path="/auth/login" element={<h1>Login page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillValidRegistration(user) {
  await user.type(screen.getByLabelText(/name owner/i), 'Maria');
  await user.type(screen.getByLabelText(/lastname/i), 'Sanchez');
  await user.type(screen.getByLabelText(/^email$/i), 'maria@example.com');
  await user.type(screen.getByLabelText(/phone number/i), '8875-4545');
  await user.type(screen.getByLabelText(/pet name/i), 'Candy');
  await user.type(screen.getByLabelText(/pet birth day/i), '10');
  await user.type(screen.getByLabelText(/pet birth month/i), '05');
  await user.type(screen.getByLabelText(/pet birth year/i), '2022');
  await user.selectOptions(screen.getByLabelText(/species of pet/i), 'Dog');
  await user.selectOptions(screen.getByLabelText(/gender/i), 'Female');
  await user.type(screen.getByLabelText(/weight/i), '8.5');
  await user.type(screen.getByLabelText(/primary breed/i), 'Beagle');
  await user.type(screen.getByLabelText(/^password$/i), 'Client2026!');
  await user.type(screen.getByLabelText(/confirm password/i), 'Client2026!');
  await user.click(screen.getByLabelText(/privacy policy/i));
}

describe('RegisterClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  test('shows required field errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole('button', { name: /accept/i }));

    expect(await screen.findByText(/owner name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/accept the privacy policy/i)).toBeInTheDocument();
  });

  test('shows invalid email and weak password errors', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/^email$/i), 'bad-email');
    await user.type(screen.getByLabelText(/^password$/i), 'short');
    await user.type(screen.getByLabelText(/confirm password/i), 'short');
    await user.click(screen.getByRole('button', { name: /accept/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/use at least 8 characters/i)).toBeInTheDocument();
  });

  test('calls the registration service with valid data and redirects on success', async () => {
    const user = userEvent.setup();
    registerUser.mockResolvedValueOnce({
      access_token: 'register-token',
      user: {
        id: 'client-1',
        email: 'maria@example.com',
        full_name: 'Maria Sanchez',
        role: 'client',
      },
    });

    renderRegister();
    await fillValidRegistration(user);
    await user.click(screen.getByRole('button', { name: /accept/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Maria Sanchez',
        email: 'maria@example.com',
        phone: '8875-4545',
        password: 'Client2026!',
        initial_pet: expect.objectContaining({
          name: 'Candy',
          birth_date: '2022-05-10',
          species: 'Dog',
          sex: 'Female',
          weight_kg: 8.5,
        }),
      }));
    });
    expect(await screen.findByRole('heading', { name: /client pets/i })).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBe('register-token');
  });

  test('shows backend errors when registration fails', async () => {
    const user = userEvent.setup();
    registerUser.mockRejectedValueOnce({
      response: { data: { detail: 'Email address is already in use' } },
    });

    renderRegister();
    await fillValidRegistration(user);
    await user.click(screen.getByRole('button', { name: /accept/i }));

    expect(await screen.findByText(/email address is already in use/i)).toBeInTheDocument();
  });
});
