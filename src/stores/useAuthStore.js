import { create } from 'zustand';

const readStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem('auth_session')) ?? {};
  } catch {
    return {};
  }
};

const initialSession = readStoredSession();

/**
 * Store de autenticación global
 * Maneja: datos del usuario logueado, JWT y rol
 */
const useAuthStore = create((set) => ({
  user: initialSession.user ?? null,
  token: initialSession.token ?? localStorage.getItem('token'),
  role: initialSession.role ?? null,
  authStatus: initialSession.token || localStorage.getItem('token')
    ? 'loading'
    : 'anonymous',

  // Acciones
  setUser: (user) => set((state) => {
    const session = {
      user,
      token: state.token,
      role: user?.role ?? state.role,
    };
    localStorage.setItem('auth_session', JSON.stringify(session));
    return { user, role: session.role };
  }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setRole: (role) => set({ role }),

  setSession: ({ user, token }) => {
    const session = { user, token, role: user.role };
    localStorage.setItem('token', token);
    localStorage.setItem('auth_session', JSON.stringify(session));
    set({ ...session, authStatus: 'authenticated' });
  },

  restoreSession: (user) => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null, role: null, authStatus: 'anonymous' });
      return;
    }
    const session = { user, token, role: user.role };
    localStorage.setItem('auth_session', JSON.stringify(session));
    set({ ...session, authStatus: 'authenticated' });
  },

  markAnonymous: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_session');
    set({ user: null, token: null, role: null, authStatus: 'anonymous' });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_session');
    set({ user: null, token: null, role: null, authStatus: 'anonymous' });
  },
}));

export default useAuthStore;
