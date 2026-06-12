/**
 * L'Agora - Gestion Signalements (Admin)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const STATUT_COLORS = {
  en_attente: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  valide: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  rejete: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

export default function AdminSignalementsPage() {
  const [statut, setStatut] = useState('en_attente');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-signalements', statut],
    queryFn: () => adminService.getSignalements({ statut }),
    select: (res) => res.data.results || res.data,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => adminService.actionSignalement(id, action),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-signalements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(action === 'valider' ? 'Signalement validé — publication retirée' : 'Signalement rejeté');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  if (isLoading) return <LoadingSpinner />;
  const signalements = data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Flag size={22} className="text-orange-500" /> Gestion des signalements
      </h1>

      {/* Filtres statut */}
      <div className="flex gap-2">
        {[
          { value: 'en_attente', label: '⏳ En attente' },
          { value: 'valide', label: '✅ Validés' },
          { value: 'rejete', label: '❌ Rejetés' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatut(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statut === value
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {signalements.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Flag size={36} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-400">Aucun signalement dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {signalements.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[s.statut]}`}>
                      {s.statut.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 rounded text-xs">
                      {s.motif.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="font-medium text-gray-900 dark:text-white text-sm mt-2 line-clamp-1">
                    Publication : « {s.publication_titre} »
                  </p>
                  {s.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">"{s.description}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Signalé par <strong>{s.utilisateur?.pseudonyme}</strong> — {s.created_at && formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>

                {s.statut === 'en_attente' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => actionMutation.mutate({ id: s.id, action: 'valider' })}
                      disabled={actionMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      {actionMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                      Valider
                    </button>
                    <button
                      onClick={() => actionMutation.mutate({ id: s.id, action: 'rejeter' })}
                      disabled={actionMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
                    >
                      <XCircle size={13} /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
