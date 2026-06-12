/**
 * L'Agora - Store d'authentification (Zustand)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, userService } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Connexion
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await authService.login(credentials);
          const { data } = res.data;
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.detail || 'Email ou mot de passe incorrect.',
          };
        }
      },

      // Inscription
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const res = await authService.register(userData);
          const { data } = res.data;
          localStorage.setItem('access_token', data.tokens.access);
          localStorage.setItem('refresh_token', data.tokens.refresh);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            errors: err.response?.data?.errors || {},
            message: 'Erreur lors de l\'inscription.',
          };
        }
      },

      // Déconnexion
      logout: async () => {
        const refresh = localStorage.getItem('refresh_token');
        try {
          await authService.logout(refresh);
        } catch {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      // Rafraîchir le profil
      refreshUser: async () => {
        try {
          const res = await userService.getMe();
          set({ user: res.data.data });
        } catch {}
      },

      // Mettre à jour l'utilisateur local
      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    {
      name: 'agora-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
