import { create } from 'zustand';

/**
 * Store de autenticación global
 * Maneja: datos del usuario logueado, JWT y rol
 */
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  role: null,

  // Acciones
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
  
  logout: () => set({ user: null, token: null, role: null }),
}));

export default useAuthStore;
