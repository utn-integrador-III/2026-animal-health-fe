import { create } from 'zustand';

/**
 * Store de tema global
 * Maneja: modo claro/oscuro y preferencias de UI
 */
const useThemeStore = create((set) => ({
  isDark: false,

  // Acciones
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  setTheme: (isDark) => set({ isDark }),
}));

export default useThemeStore;
