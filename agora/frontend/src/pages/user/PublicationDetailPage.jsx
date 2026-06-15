/**
 * L'Agora - Page Détail Publication
 */
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft, ThumbsUp, Heart, HandshakeIcon,
  MessageCircle, Eye, Send, Trash2, Edit3, EyeOff, Loader2
} from 'lucide-react';
import { publicationService, commentService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' },
  { type: 'support', icon: HandshakeIcon, label: 'Support', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
];

export default function PublicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['publication', id],
    queryFn: () => publicationService.get(id),
    select: (res) => res.data.data,
  });

  const reactMutation = useMutation({
    mutationFn: (type) => {
      if (data?.reactions_summary?.user_reaction === type) {
        return publicationService.removeReact(id);
      }
      return publicationService.react(id, type);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['publication', id] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      await refreshUser();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (contenu) => commentService.create(id, { contenu }),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['publication', id] });
      toast.success('Commentaire ajouté');
    },
    onError: () => toast.error('Erreur lors de l\'ajout du commentaire'),
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, contenu }) => commentService.update(id, commentId, { contenu }),
    onSuccess: () => {
      setEditingComment(null);
      queryClient.invalidateQueries({ queryKey: ['publication', id] });
      toast.success('Commentaire modifié');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentService.delete(id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publication', id] });
      toast.success('Commentaire supprimé');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-10 text-gray-500">Publication introuvable.</div>;

  const summary = data.reactions_summary || {};
  const isOwner = user?.id === data.auteur?.id && !data.is_anonymous;

  return (
    <div className="space-y-6">
      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={16} /> Retour au fil
      </button>

      {/* Publication */}
      <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {/* Auteur */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
            {data.is_anonymous ? <EyeOff size={18} /> : data.auteur?.pseudonyme?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.is_anonymous ? 'Anonyme' : data.auteur?.pseudonyme}
            </p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(data.created_at), { addSuffix: true, locale: fr })}
              {data.categorie && <span className="ml-2 px-1.5 py-0.5 rounded text-white text-xs font-medium" style={{ backgroundColor: data.categorie.couleur }}>{data.categorie.icone} {data.categorie.nom}</span>}
            </p>
          </div>
          {isOwner && (
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => navigate(`/publications/${id}/edit`)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Edit3 size={13} /> Modifier
              </button>
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{data.titre}</h1>
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{data.contenu}</div>

        {/* Tags */}
        {data.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {data.tags.map(tag => (
              <span key={tag.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">#{tag.nom}</span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Eye size={13} /> {data.views_count} vues</span>
          <span className="flex items-center gap-1"><MessageCircle size={13} /> {data.comments?.length || 0} commentaires</span>
          <span className="flex items-center gap-1">❤️ {summary.total || 0} réactions</span>
        </div>

        {/* Réactions */}
        <div className="flex gap-2 mt-4">
          {REACTIONS.map(({ type, icon: Icon, label, color, bg }) => (
            <button
              key={type}
              onClick={() => reactMutation.mutate(type)}
              disabled={reactMutation.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                summary.user_reaction === type
                  ? `${bg} ${color} border-current`
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={15} /> {label} <span className="text-xs opacity-70">({summary[type] || 0})</span>
            </button>
          ))}
        </div>
      </article>

      {/* Section commentaires */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-indigo-500" />
          Commentaires ({data.comments?.length || 0})
        </h2>

        {/* Zone de saisie */}
        <div className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
            {user?.pseudonyme?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Votre commentaire..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button
              onClick={() => comment.trim() && addCommentMutation.mutate(comment.trim())}
              disabled={!comment.trim() || addCommentMutation.isPending}
              className="self-end px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg transition-colors"
            >
              {addCommentMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>

        {/* Liste commentaires */}
        {data.comments?.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">Soyez le premier à commenter !</p>
        ) : (
          <div className="space-y-4">
            {data.comments?.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                  {c.auteur?.pseudonyme?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{c.auteur?.pseudonyme}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr })}
                      </span>
                      {user?.id === c.auteur?.id && (
                        <div className="flex gap-1">
                          <button onClick={() => setEditingComment(c)} className="text-gray-400 hover:text-indigo-500"><Edit3 size={13} /></button>
                          <button onClick={() => deleteCommentMutation.mutate(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  {editingComment?.id === c.id ? (
                    <div className="flex gap-2 mt-2">
                      <textarea
                        value={editingComment.contenu}
                        onChange={(e) => setEditingComment({ ...editingComment, contenu: e.target.value })}
                        rows={2}
                        className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex flex-col gap-1">
                        <button onClick={() => updateCommentMutation.mutate({ commentId: c.id, contenu: editingComment.contenu })} className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">OK</button>
                        <button onClick={() => setEditingComment(null)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded">✕</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{c.contenu}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
