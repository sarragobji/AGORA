/**
 * L'Agora - Layout pour la Homepage (Landing Page)
 */
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function HomepageLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header léger */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">L'Agora</h1>
          <nav className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
              Se connecter
            </Link>
            <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
              S'inscrire
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenu */}
      <main>
        <Outlet />
      </main>

      {/* Footer simple */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>&copy; 2026 L'Agora - Plateforme d'entraide étudiante tunisienne</p>
        </div>
      </footer>
    </div>
  );
}
