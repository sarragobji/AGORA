/**
 * L'Agora - Gestion Publications (Admin)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminPublicationsPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-publications', search],
    queryFn: () => adminService.getPublications({ search: search || undefined }),
    select: (res) => res.data.results || res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deletePublication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] });
      toast.success('Publication retirée');
    },
    onError: () => toast.error('Erreur'),
  });

  if (isLoading) return <LoadingSpinner />;
  const publications = data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des publications</h1>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une publication..." className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="space-y-3">
        {publications.length === 0 ? (
          <p className="text-center py-10 text-gray-400">Aucune publication.</p>
        ) : (
          publications.map((pub) => (
            <div key={pub.id} className={`bg-white dark:bg-gray-900 rounded-xl border p-4 ${pub.is_active !== false ? 'border-gray-200 dark:border-gray-800' : 'border-red-200 dark:border-red-900 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {pub.categorie && (
                      <span className="px-1.5 py-0.5 rounded text-white text-xs" style={{ backgroundColor: pub.categorie.couleur }}>
                        {pub.categorie.nom}
                      </span>
                    )}
                    {pub.is_anonymous && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded text-xs">
                        <EyeOff size={10} /> Anonyme
                      </span>
                    )}
                    {pub.is_active === false && (
                      <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 rounded text-xs font-medium">Retirée</span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mt-1.5 line-clamp-1">{pub.titre}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {pub.is_anonymous ? 'Anonyme' : pub.auteur?.pseudonyme} · {pub.created_at && formatDistanceToNow(new Date(pub.created_at), { addSuffix: true, locale: fr })}
                    · {pub.views_count} vues · {pub.comments_count} commentaires
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/publications/${pub.id}`} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded transition" title="Voir">
                    <Eye size={15} />
                  </Link>
                  {pub.is_active !== false && (
                    <button
                      onClick={() => { if (confirm('Retirer cette publication ?')) deleteMutation.mutate(pub.id); }}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition"
                      title="Retirer"
                    >
                      {deleteMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
