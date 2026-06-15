/**
 * L'Agora - Page Boîte de réception
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { userService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function InboxPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => userService.getConversations(),
    select: (res) => res.data.data || res.data,
    retry: false,
  });

  const conversations = data?.conversations || [];
  const unreadCount = data?.unread_count || 0;

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="text-center py-10 text-gray-500">
        Impossible de charger votre boîte de réception.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Boîte de réception</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vous avez {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}.</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune conversation pour le moment.</p>
          <p className="text-sm text-gray-400 mt-3">Visitez un profil pour démarrer un échange privé.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Link
              key={conversation.partner.id}
              to={`/messages/${conversation.partner.pseudonyme}`}
              className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition hover:border-indigo-500 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold text-lg">
                  {conversation.partner.pseudonyme?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">{conversation.partner.pseudonyme}</h2>
                    {conversation.unread_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                        {conversation.unread_count} non lu{conversation.unread_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{conversation.last_message.contenu}</p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-indigo-600 transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
