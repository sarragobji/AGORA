/**
 * L'Agora - Page Message Privé
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Send, Loader2 } from 'lucide-react';
import { userService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DirectMessagePage() {
  const { pseudonyme } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [contenu, setContenu] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['conversation', pseudonyme],
    queryFn: () => userService.getConversation(pseudonyme),
    select: (res) => res.data.data || res.data,
    retry: false,
  });

  const recipient = data?.recipient;
  const messages = data?.messages || [];

  const sendMessageMutation = useMutation({
    mutationFn: (message) => userService.sendMessage(pseudonyme, message),
    onSuccess: () => {
      setContenu('');
      queryClient.invalidateQueries({ queryKey: ['conversation', pseudonyme] });
      toast.success('Message envoyé');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="text-center py-10 text-gray-500">
        Impossible de charger la conversation.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to={`/profile/${pseudonyme}`} className="flex items-center gap-2 hover:underline">
            <ArrowLeft size={16} /> Retour au profil
          </Link>
          <span>•</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Conversation avec {recipient?.pseudonyme || pseudonyme}
          </span>
        </div>
        <Link
          to={`/profile/${recipient?.pseudonyme || pseudonyme}`}
          className="inline-flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Voir le profil
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
            {recipient?.pseudonyme?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{recipient?.pseudonyme}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Message privé</p>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">
              Envoyez le premier message.
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender?.id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`max-w-[85%] p-4 rounded-2xl ${isMine ? 'ml-auto bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{isMine ? 'Vous' : message.sender?.pseudonyme}</span>
                    <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.contenu}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="flex gap-3">
            <textarea
              rows={3}
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 min-h-[80px] resize-none rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => contenu.trim() && sendMessageMutation.mutate({ contenu: contenu.trim() })}
              disabled={!contenu.trim() || sendMessageMutation.isPending}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {sendMessageMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
