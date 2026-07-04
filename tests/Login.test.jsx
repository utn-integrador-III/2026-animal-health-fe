import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Login from '../src/pages/auth/Login';
import useAuthStore from '../src/stores/useAuthStore';
import { loginUser } from '../src/services/authService';

vi.mock('../src/services/authService', () => ({
  loginUser: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/auth/login']}>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/client/pets" element={<h1>Client pets</h1>} />
        <Route path="/vet/dashboard" element={<h1>Vet dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  test('marks email and password as required', () => {
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  test('shows an error when the backend rejects login', async () => {
    const user = userEvent.setup();
    loginUser.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid credentials' } },
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'owner@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test('redirects client users to client pets and stores the session', async () => {
    const user = userEvent.setup();
    const authUser = {
      id: 'client-1',
      email: 'owner@example.com',
      full_name: 'Owner Example',
      role: 'client',
    };
    loginUser.mockResolvedValueOnce({
      access_token: 'client-token',
      user: authUser,
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'owner@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Client2026!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: /client pets/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('client-token');
      expect(useAuthStore.getState().user).toEqual(authUser);
    });
  });

  test('redirects veterinarian users to the vet dashboard and stores the session', async () => {
    const user = userEvent.setup();
    const authUser = {
      id: 'vet-1',
      email: 'vet@example.com',
      full_name: 'Vet Example',
      role: 'veterinarian',
    };
    loginUser.mockResolvedValueOnce({
      access_token: 'vet-token',
      user: authUser,
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'vet@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Vet2026!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: /vet dashboard/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('vet-token');
      expect(useAuthStore.getState().user).toEqual(authUser);
    });
  });
});
