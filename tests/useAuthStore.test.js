import { beforeEach, describe, expect, test, vi } from 'vitest';
import useAuthStore from '../src/stores/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      role: null,
      authStatus: 'anonymous',
    });
  });

  test('setUser updates user and role in state and auth_session in localStorage', () => {
    const mockUser = { id: 'usr-1', name: 'Ana', role: 'veterinarian' };
    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().role).toBe('veterinarian');
    expect(JSON.parse(localStorage.getItem('auth_session'))).toEqual({
      user: mockUser,
      token: null,
      role: 'veterinarian',
    });
  });

  test('setUser with null user retains existing role or fallback', () => {
    useAuthStore.setState({ role: 'client' });
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().role).toBe('client');
  });

  test('setToken sets token in localStorage and state when token is provided', () => {
    useAuthStore.getState().setToken('token-abc-123');

    expect(useAuthStore.getState().token).toBe('token-abc-123');
    expect(localStorage.getItem('token')).toBe('token-abc-123');
  });

  test('setToken removes token from localStorage when token is null or empty', () => {
    localStorage.setItem('token', 'token-to-remove');
    useAuthStore.getState().setToken(null);

    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('setRole updates the role in state', () => {
    useAuthStore.getState().setRole('admin');
    expect(useAuthStore.getState().role).toBe('admin');
  });

  test('setSession updates token, auth_session, and sets authStatus to authenticated', () => {
    const mockUser = { id: 'usr-2', name: 'Carlos', role: 'client' };
    useAuthStore.getState().setSession({ user: mockUser, token: 'token-xyz' });

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe('token-xyz');
    expect(useAuthStore.getState().role).toBe('client');
    expect(useAuthStore.getState().authStatus).toBe('authenticated');
    expect(localStorage.getItem('token')).toBe('token-xyz');
    expect(JSON.parse(localStorage.getItem('auth_session'))).toEqual({
      user: mockUser,
      token: 'token-xyz',
      role: 'client',
    });
  });

  test('restoreSession authenticates when token exists in localStorage', () => {
    localStorage.setItem('token', 'valid-token-789');
    const mockUser = { id: 'usr-3', role: 'veterinarian' };

    useAuthStore.getState().restoreSession(mockUser);

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe('valid-token-789');
    expect(useAuthStore.getState().role).toBe('veterinarian');
    expect(useAuthStore.getState().authStatus).toBe('authenticated');
    expect(JSON.parse(localStorage.getItem('auth_session'))).toEqual({
      user: mockUser,
      token: 'valid-token-789',
      role: 'veterinarian',
    });
  });

  test('restoreSession sets anonymous state when token does not exist in localStorage', () => {
    localStorage.removeItem('token');
    const mockUser = { id: 'usr-3', role: 'veterinarian' };

    useAuthStore.getState().restoreSession(mockUser);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().role).toBeNull();
    expect(useAuthStore.getState().authStatus).toBe('anonymous');
  });

  test('markAnonymous clears token and auth_session and sets state to anonymous', () => {
    localStorage.setItem('token', 'temp-token');
    localStorage.setItem('auth_session', JSON.stringify({ user: { id: 1 } }));

    useAuthStore.getState().markAnonymous();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().role).toBeNull();
    expect(useAuthStore.getState().authStatus).toBe('anonymous');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('auth_session')).toBeNull();
  });

  test('logout clears token and auth_session and sets state to anonymous', () => {
    localStorage.setItem('token', 'temp-token-2');
    localStorage.setItem('auth_session', JSON.stringify({ user: { id: 2 } }));

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().role).toBeNull();
    expect(useAuthStore.getState().authStatus).toBe('anonymous');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('auth_session')).toBeNull();
  });

  test('handles corrupt auth_session JSON in localStorage gracefully during readStoredSession', async () => {
    localStorage.setItem('auth_session', '{invalid-json');
    // Re-import module to trigger readStoredSession try/catch block
    vi.resetModules();
    const { default: freshAuthStore } = await import('../src/stores/useAuthStore');
    expect(freshAuthStore.getState().user).toBeNull();
  });

  test('initializes authStatus to loading when only token exists in localStorage without auth_session', async () => {
    localStorage.clear();
    localStorage.setItem('token', 'only-token');
    vi.resetModules();
    const { default: freshAuthStore } = await import('../src/stores/useAuthStore');
    expect(freshAuthStore.getState().authStatus).toBe('loading');
  });
});
