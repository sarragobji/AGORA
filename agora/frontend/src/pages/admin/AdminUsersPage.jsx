/**
 * L'Agora - Gestion Utilisateurs (Admin)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, filterActive],
    queryFn: () => adminService.getUsers({ search: search || undefined, is_active: filterActive || undefined }),
    select: (res) => res.data.results || res.data,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => adminService.updateUser(id, { action }),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(action === 'activate' ? 'Compte activé' : 'Compte désactivé');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  if (isLoading) return <LoadingSpinner />;
  const users = data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h1>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none">
          <option value="">Tous les comptes</option>
          <option value="true">Actifs</option>
          <option value="false">Désactivés</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Utilisateur', 'Email', 'Rôle', 'Points', 'Inscrit', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {u.pseudonyme?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{u.pseudonyme}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{u.role?.role_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-600 font-medium">{u.points_solidarite}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {u.created_at && formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: fr })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'}`}>
                      {u.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role?.role_name !== 'admin' && (
                      <button
                        onClick={() => actionMutation.mutate({ id: u.id, action: u.is_active ? 'deactivate' : 'activate' })}
                        disabled={actionMutation.isPending}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          u.is_active
                            ? 'bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                            : 'bg-green-50 dark:bg-green-950 text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                        }`}
                      >
                        {actionMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : u.is_active ? <UserX size={11} /> : <UserCheck size={11} />}
                        {u.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">Aucun utilisateur trouvé.</p>}
      </div>
    </div>
  );
}
