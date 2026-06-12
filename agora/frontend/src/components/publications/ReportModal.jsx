/**
 * L'Agora - Modal Signalement
 */
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Flag, Loader2 } from 'lucide-react';
import { publicationService } from '../../services/api';
import toast from 'react-hot-toast';

const MOTIFS = [
  { value: 'spam', label: '🚫 Spam' },
  { value: 'inapproprie', label: '⚠️ Contenu inapproprié' },
  { value: 'harcelement', label: '😠 Harcèlement' },
  { value: 'fausse_info', label: '❌ Fausse information' },
  { value: 'autre', label: '📌 Autre' },
];

export default function ReportModal({ publicationId, onClose }) {
  const [motif, setMotif] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: () => publicationService.report(publicationId, { motif, description }),
    onSuccess: () => {
      toast.success('Signalement envoyé. Merci pour votre vigilance.');
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors du signalement');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Flag size={18} className="text-orange-500" /> Signaler cette publication
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motif *</label>
            <div className="space-y-2">
              {MOTIFS.map(({ value, label }) => (
                <label key={value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${motif === value ? 'border-orange-400 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input type="radio" name="motif" value={value} checked={motif === value} onChange={() => setMotif(value)} className="text-orange-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement le problème..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Annuler
          </button>
          <button
            onClick={() => reportMutation.mutate()}
            disabled={!motif || reportMutation.isPending}
            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {reportMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
            Signaler
          </button>
        </div>
      </div>
    </div>
  );
}
