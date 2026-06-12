/**
 * L'Agora - Feed Principal
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, PlusCircle, TrendingUp } from 'lucide-react';
import { publicationService, categoryService } from '../../services/api';
import PublicationCard from '../../components/publications/PublicationCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function FeedPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
    select: (res) => res.data.results || res.data,
  });

  const { data: feedData, isLoading, isFetching } = useQuery({
    queryKey: ['publications', search, selectedCategory, ordering, page],
    queryFn: () => publicationService.list({
      search: search || undefined,
      categorie: selectedCategory || undefined,
      ordering,
      page,
    }),
    keepPreviousData: true,
  });

  const publications = feedData?.data?.results || [];
  const totalCount = feedData?.data?.count || 0;
  const totalPages = Math.ceil(totalCount / 15);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fil d'actualité</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {totalCount} publication{totalCount !== 1 ? 's' : ''} partagée{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/publications/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle size={16} />
          Publier
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        {/* Recherche */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher des publications..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Catégories */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedCategory(''); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Tous
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory == cat.id
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={selectedCategory == cat.id ? { backgroundColor: cat.couleur } : {}}
              >
                {cat.icone} {cat.nom}
              </button>
            ))}
          </div>

          {/* Tri */}
          <select
            value={ordering}
            onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
            className="ml-auto px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
          >
            <option value="-created_at">Plus récents</option>
            <option value="created_at">Plus anciens</option>
            <option value="-views_count">Plus vus</option>
            <option value="-reactions_count">Plus réagis</option>
          </select>
        </div>
      </div>

      {/* Publications */}
      {isLoading ? (
        <LoadingSpinner />
      ) : publications.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune publication trouvée</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Soyez le premier à partager quelque chose !
          </p>
          <Link
            to="/publications/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <PlusCircle size={16} /> Créer une publication
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
