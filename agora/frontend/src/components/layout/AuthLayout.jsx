import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-indigo-600 dark:text-indigo-400">L'Agora</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Le portail des étudiants universitaires tunisiens
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
