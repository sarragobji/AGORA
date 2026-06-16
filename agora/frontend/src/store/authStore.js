/**
 * L'Agora - Store d'authentification (Zustand)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, userService } from '../services/api';

const normalizeUser = (user) => {
  if (!user) return null;
  const roleName = typeof user.role === 'string'
    ? user.role
    : user.role?.role_name || null;
  return {
    ...user,
    role: roleName,
    is_admin: roleName === 'admin',
  };
};

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
          const normalizedUser = normalizeUser(data.user);
          set({
            user: normalizedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          await get().refreshUser();
          return { success: true, user: get().user };
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
          const normalizedUser = normalizeUser(data.user);
          set({
            user: normalizedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, user: normalizedUser };
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
          set({ user: normalizeUser(res.data.data || res.data) });
        } catch {}
      },

      // Mettre à jour l'utilisateur local
      updateUser: (userData) => set({ user: normalizeUser({ ...get().user, ...userData }) }),
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
