/**
 * L'Agora - Page Historique
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, MessageCircle, Clock } from 'lucide-react';
import { userService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function HistoryPage() {
  const [tab, setTab] = useState('publications');

  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => userService.getHistory(),
    select: (res) => res.data.data,
  });

  if (isLoading) return <LoadingSpinner />;

  const publications = data?.publications || [];
  const comments = data?.comments || [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock size={22} className="text-indigo-500" /> Mon historique
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Vos 20 dernières activités</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setTab('publications')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'publications' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <BookOpen size={15} /> Publications ({publications.length})
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'comments' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <MessageCircle size={15} /> Commentaires ({comments.length})
        </button>
      </div>

      {tab === 'publications' ? (
        publications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucune publication pour le moment.</div>
        ) : (
          <div className="space-y-3">
            {publications.map((pub) => (
              <Link
                key={pub.id}
                to={`/publications/${pub.id}`}
                className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{pub.titre}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(pub.created_at), { addSuffix: true, locale: fr })}
                      {pub.categorie && <span className="ml-2 px-1.5 py-0.5 rounded text-white text-xs" style={{ backgroundColor: pub.categorie.couleur }}>{pub.categorie.nom}</span>}
                    </p>
                  </div>
                  {pub.is_anonymous && <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full flex-shrink-0">Anonyme</span>}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        comments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucun commentaire pour le moment.</div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <Link
                key={c.id}
                to={`/publications/${c.publication}`}
                className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{c.contenu}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr })}
                </p>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
