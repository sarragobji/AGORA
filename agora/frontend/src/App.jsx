/**
 * L'Agora - Application principale
 */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import HomepageLayout from './components/layout/HomepageLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy loading des pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const FeedPage = lazy(() => import('./pages/user/FeedPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const PublicationDetailPage = lazy(() => import('./pages/user/PublicationDetailPage'));
const CreatePublicationPage = lazy(() => import('./pages/user/CreatePublicationPage'));
const EditPublicationPage = lazy(() => import('./pages/user/EditPublicationPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const InboxPage = lazy(() => import('./pages/user/InboxPage'));
const DirectMessagePage = lazy(() => import('./pages/user/DirectMessagePage'));
const HistoryPage = lazy(() => import('./pages/user/HistoryPage'));
const NotificationsPage = lazy(() => import('./pages/user/NotificationsPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminPublicationsPage = lazy(() => import('./pages/admin/AdminPublicationsPage'));
const AdminSignalementsPage = lazy(() => import('./pages/admin/AdminSignalementsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

// Garde de route — utilisateur connecté
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Garde de route — administrateur
const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.is_admin || user?.role === 'admin' || user?.role?.role_name === 'admin';
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Redirection si déjà connecté (pour auth pages)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.is_admin || user?.role === 'admin' || user?.role?.role_name === 'admin';
  return isAuthenticated ? <Navigate to={isAdmin ? '/admin' : '/feed'} replace /> : children;
};

// Redirection si authentifié sur homepage
const HomeRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/feed" replace /> : children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <Routes>
            {/* Routes publiques (auth) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            </Route>

            {/* Homepage (public) - redirect authenticated users to feed */}
            <Route element={<HomepageLayout />}>
              <Route path="/" element={<HomeRoute><HomePage /></HomeRoute>} />
            </Route>

            {/* Routes protégées (utilisateur) */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/publications/:id" element={<PublicationDetailPage />} />
              <Route path="/publications/:id/edit" element={<EditPublicationPage />} />
              <Route path="/publications/new" element={<CreatePublicationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:pseudonyme" element={<ProfilePage />} />
              <Route path="/messages" element={<InboxPage />} />
              <Route path="/messages/:pseudonyme" element={<DirectMessagePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Routes admin */}
            <Route element={<AdminRoute><MainLayout isAdmin /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/publications" element={<AdminPublicationsPage />} />
              <Route path="/admin/publications/:id" element={<PublicationDetailPage />} />
              <Route path="/admin/signalements" element={<AdminSignalementsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
