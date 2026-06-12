/**
 * L'Agora - Spinner de chargement
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-indigo-500" />
    </div>
  );
}
