import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';

import ProtectedRoute from '../src/routes/ProtectedRoute';
import RoleGuard from '../src/routes/RoleGuard';
import useAuthStore from '../src/stores/useAuthStore';

function setAuthSession(role) {
  useAuthStore.setState({
    user: { id: `${role}-1`, email: `${role}@example.com`, role },
    token: `${role}-token`,
    role,
    authStatus: 'authenticated',
  });
}

function renderProtectedRoute(initialPath, allowedRoles) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth/login" element={<h1>Login page</h1>} />
        <Route path="/unauthorized" element={<h1>Access denied</h1>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRoles={allowedRoles} />}>
            <Route path="/client/pets" element={<h1>Client area</h1>} />
            <Route path="/vet/dashboard" element={<h1>Vet area</h1>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('protected routes', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  test('redirects users without token to login', () => {
    renderProtectedRoute('/client/pets', ['client']);

    expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument();
  });

  test('allows clients to enter client routes', () => {
    setAuthSession('client');
    renderProtectedRoute('/client/pets', ['client']);

    expect(screen.getByRole('heading', { name: /client area/i })).toBeInTheDocument();
  });

  test('blocks veterinarians from client routes', () => {
    setAuthSession('veterinarian');
    renderProtectedRoute('/client/pets', ['client']);

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
  });

  test('blocks clients from veterinarian routes', () => {
    setAuthSession('client');
    renderProtectedRoute('/vet/dashboard', ['veterinarian']);

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
  });

  test('redirects unsupported roles to unauthorized', () => {
    setAuthSession('admin');
    renderProtectedRoute('/client/pets', ['client']);

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
  });
});
