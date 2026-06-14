/**
 * L'Agora - Layout Principal
 */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home, PlusSquare, Bell, User, BookOpen, LogOut,
  LayoutDashboard, Users, FileText, Flag, Menu, X,
  ChevronDown, Award, Moon, Sun,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/publications/new', icon: PlusSquare, label: 'Publier' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Mon profil' },
  { to: '/history', icon: BookOpen, label: 'Historique' },
];

const adminItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/publications', icon: FileText, label: 'Publications' },
  { to: '/admin/signalements', icon: Flag, label: 'Signalements' },
];

export default function MainLayout({ isAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains('dark')
  );
  const { user, logout } = useAuthStore();
  
  const navigate = useNavigate();

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationService.list(),
    refetchInterval: 30000,
    select: (res) => res.data.unread_count,
  });

  const handleLogout = async () => {
    await logout();
    toast.success('À bientôt !');
    navigate('/login');
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const items = isAdmin ? adminItems : navItems;
  console.log(isAdmin);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full z-40">
        <SidebarContent
          items={items}
          user={user}
          unreadCount={notifData}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          isAdmin={isAdmin}
        />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50
        transform transition-transform duration-200 lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          className="absolute top-4 right-4 text-gray-500"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
        <SidebarContent
          items={items}
          user={user}
          unreadCount={notifData}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          isAdmin={isAdmin}
        />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 lg:ml-64">
        {/* Topbar mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-gray-600 dark:text-gray-300" />
          </button>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">L'Agora</span>
          <div className="w-8" />
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ items, user, unreadCount, onLogout, darkMode, onToggleDark, isAdmin }) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">L'Agora</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {isAdmin ? 'Administration' : 'Portail étudiant tunisien'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/admin'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors relative
              ${isActive
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bas sidebar */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 space-y-2">
        {/* Points solidarité */}
        
        {user && !isAdmin && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950">
            <Award size={16} className="text-amber-500" />
            <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              
              {user.points_solidarite} points
            </span>
          </div>
        )}

        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
        </button>

        {/* User info + logout */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
              {user.pseudonyme?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.pseudonyme}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
