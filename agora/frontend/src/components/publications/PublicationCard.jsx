/**
 * L'Agora - Carte Publication
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ThumbsUp, Heart, HandshakeIcon, MessageCircle,
  Eye, MoreHorizontal, Trash2, Edit3, Flag,
  EyeOff, User,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import ReportModal from './ReportModal';

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
  { type: 'support', icon: HandshakeIcon, label: 'Support', color: 'text-green-500' },
];

export default function PublicationCard({ publication }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user, refreshUser } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const reactMutation = useMutation({
    mutationFn: ({ type }) => {
      const current = publication.reactions_summary?.user_reaction;
      if (current === type) {
        return publicationService.removeReact(publication.id);
      }
      return publicationService.react(publication.id, type);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      queryClient.invalidateQueries({ queryKey: ['publication', publication.id] });
      await refreshUser();
    },
    onError: () => toast.error('Erreur lors de la réaction'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => publicationService.delete(publication.id),
    onSuccess: () => {
      toast.success('Publication supprimée');
      queryClient.invalidateQueries({ queryKey: ['publications'] });
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const summary = publication.reactions_summary || {};
  const isOwner = user?.id === publication.auteur?.id && !publication.is_anonymous;

  const handleDelete = () => {
    if (confirm('Supprimer cette publication ?')) deleteMutation.mutate();
    setShowMenu(false);
  };

  return (
    <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors overflow-hidden">
      {/* En-tête */}
      <div className="p-4 pb-0 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
            {publication.is_anonymous
              ? <EyeOff size={16} />
              : (publication.auteur?.pseudonyme?.[0]?.toUpperCase() || <User size={16} />)
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {publication.is_anonymous ? 'Anonyme' : (publication.auteur?.pseudonyme || 'Utilisateur')}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatDistanceToNow(new Date(publication.created_at), { addSuffix: true, locale: fr })}</span>
              {publication.categorie && (
                <>
                  <span>·</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: publication.categorie.couleur }}
                  >
                    {publication.categorie.icone} {publication.categorie.nom}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
              {isOwner && (
                <>
                  <button
                    onClick={() => { navigate(`/publications/${publication.id}/edit`); setShowMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                  >
                    <Edit3 size={14} /> Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 w-full"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </>
              )}
              {!isOwner && (
                <button
                  onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 w-full"
                >
                  <Flag size={14} /> Signaler
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <Link to={`/publications/${publication.id}`} className="block p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-2 leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          {publication.titre}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
          {publication.contenu}
        </p>
      </Link>

      {/* Tags */}
      {publication.tags?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {publication.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs"
            >
              #{tag.nom}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1">
        {/* Réactions */}
        {REACTIONS.map(({ type, icon: Icon, label, color }) => (
          <button
            key={type}
            onClick={() => reactMutation.mutate({ type })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              summary.user_reaction === type
                ? `bg-gray-100 dark:bg-gray-800 ${color}`
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            disabled={reactMutation.isPending}
          >
            <Icon size={14} className={summary.user_reaction === type ? color : ''} />
            <span>{summary[type] || 0}</span>
          </button>
        ))}

        {/* Commentaires */}
        <Link
          to={`/publications/${publication.id}`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
        >
          <MessageCircle size={14} />
          <span>{publication.comments_count || 0}</span>
        </Link>

        {/* Vues */}
        <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
          <Eye size={13} />
          <span>{publication.views_count}</span>
        </div>
      </div>

      {/* Modal signalement */}
      {showReportModal && (
        <ReportModal
          publicationId={publication.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </article>
  );
}
