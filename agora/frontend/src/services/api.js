/**
 * L'Agora - Configuration Axios
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Intercepteur requête — injecter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponse — gérer le refresh automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          // Refresh échoué → déconnexion
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Services spécialisés ────────────────────────────────────────────────────

export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

export const userService = {
  getMe: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/me/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.post('/users/me/change-password/', data),
  getHistory: () => api.get('/users/me/history/'),
  getPublicProfile: (pseudonyme) => api.get(`/users/${pseudonyme}/`),
};

export const publicationService = {
  list: (params) => api.get('/publications/', { params }),
  get: (id) => api.get(`/publications/${id}/`),
  create: (data) => api.post('/publications/', data),
  update: (id, data) => api.patch(`/publications/${id}/`, data),
  delete: (id) => api.delete(`/publications/${id}/`),
  react: (id, type) => api.post(`/publications/${id}/react/`, { type }),
  removeReact: (id) => api.delete(`/publications/${id}/react/`),
  report: (id, data) => api.post(`/publications/${id}/report/`, data),
};

export const commentService = {
  list: (pubId) => api.get(`/publications/${pubId}/comments/`),
  create: (pubId, data) => api.post(`/publications/${pubId}/comments/`, data),
  update: (pubId, id, data) => api.patch(`/publications/${pubId}/comments/${id}/`, data),
  delete: (pubId, id) => api.delete(`/publications/${pubId}/comments/${id}/`),
};

export const categoryService = {
  list: () => api.get('/categories/'),
};

export const tagService = {
  list: (search) => api.get('/tags/', { params: { search } }),
};

export const notificationService = {
  list: () => api.get('/notifications/'),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
  markRead: (id) => api.patch(`/notifications/${id}/read/`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: (params) => api.get('/admin/users/', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  getPublications: (params) => api.get('/admin/publications/', { params }),
  deletePublication: (id) => api.delete(`/admin/publications/${id}/`),
  getSignalements: (params) => api.get('/admin/signalements/', { params }),
  actionSignalement: (id, action) => api.patch(`/admin/signalements/${id}/`, { action }),
};
