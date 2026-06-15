/**
 * L'Agora - Modifier une publication
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { EyeOff, X, Plus, Loader2 } from 'lucide-react';
import { publicationService, categoryService } from '../../services/api';
import toast from 'react-hot-toast';

export default function EditPublicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre: '', contenu: '', categorie: '', is_anonymous: false });
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const hasPrefilled = useRef(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
    select: (res) => res.data.results || res.data,
  });

  const { data: publicationData, isLoading: isLoadingPublication, isError } = useQuery({
    queryKey: ['publication', id],
    queryFn: () => publicationService.get(id),
    select: (res) => res.data.data || res.data,
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (publicationData && !hasPrefilled.current) {
      setForm({
        titre: publicationData.titre || '',
        contenu: publicationData.contenu || '',
        categorie: publicationData.categorie?.id || '',
        is_anonymous: publicationData.is_anonymous || false,
      });
      setTags(publicationData.tags?.map((tag) => tag.nom) || []);
      hasPrefilled.current = true;
    }
  }, [publicationData]);

  const updateMutation = useMutation({
    mutationFn: (data) => publicationService.update(id, data),
    onSuccess: (res) => {
      toast.success('Publication modifiée ! ✨');
      navigate(`/publications/${id}`);
    },
    onError: (err) => {
      const errs = err.response?.data?.errors || {};
      setErrors(errs);
      toast.error('Veuillez corriger les erreurs.');
    },
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.titre.trim()) errs.titre = 'Le titre est obligatoire';
    if (!form.contenu.trim()) errs.contenu = 'Le contenu est obligatoire';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    updateMutation.mutate({ ...form, tag_names: tags });
  };

  if (isLoadingPublication) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-500">Chargement de la publication...</div>
      </div>
    );
  }

  if (isError || !publicationData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-500">Impossible de charger la publication.</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Modifier la publication</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              placeholder="Un titre clair et descriptif..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu *</label>
            <textarea
              value={form.contenu}
              onChange={(e) => setForm({ ...form, contenu: e.target.value })}
              placeholder="Partagez votre question, ressource ou expérience..."
              rows={6}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
            {errors.contenu && <p className="text-red-500 text-xs mt-1">{errors.contenu}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
            <select
              value={form.categorie}
              onChange={(e) => setForm({ ...form, categorie: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choisir une catégorie --</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icone} {cat.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags <span className="text-gray-400 font-normal">(max 5)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="ex: tunis, coloc, maths..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <Plus size={16} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <input
              type="checkbox"
              checked={form.is_anonymous}
              onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                <EyeOff size={15} className="text-gray-500" /> Publier anonymement
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Votre identité ne sera pas visible par les autres.</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Annuler
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {updateMutation.isPending && <Loader2 size={15} className="animate-spin" />}
              {updateMutation.isPending ? 'Mise à jour...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
