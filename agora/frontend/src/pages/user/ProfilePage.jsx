/**
 * L'Agora - Page Profil
 */
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Award, Edit3, Save, X, Loader2 } from 'lucide-react';
import { userService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProfilePage() {
  const { pseudonyme } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const fileRef = useRef();

  const isOwn = !pseudonyme || pseudonyme === currentUser?.pseudonyme;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', pseudonyme || 'me'],
    queryFn: () => isOwn ? userService.getMe() : userService.getPublicProfile(pseudonyme),
    select: (res) => res.data.data || res.data,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v); });
      return userService.updateMe(fd);
    },
    onSuccess: (res) => {
      const updated = res.data.data || res.data;
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditing(false);
      toast.success('Profil mis à jour !');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center py-10 text-gray-500">Profil introuvable.</div>;

  const startEdit = () => {
    setForm({ first_name: profile.first_name, last_name: profile.last_name, bio: profile.bio || '' });
    setEditing(true);
  };

  const handleSave = () => updateMutation.mutate(form);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fd = new FormData();
      fd.append('photo', file);
      updateMutation.mutate({ photo: file });
    }
  };

  const levelBadge = (pts) => {
    if (pts >= 500) return { label: 'Mentor', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' };
    if (pts >= 200) return { label: 'Actif', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' };
    if (pts >= 50) return { label: 'Membre', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' };
    return { label: 'Nouveau', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' };
  };

  const badge = levelBadge(profile.points_solidarite || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Carte profil */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl overflow-hidden">
              {profile.photo_url
                ? <img src={profile.photo_url} alt="avatar" className="w-full h-full object-cover" />
                : profile.pseudonyme?.[0]?.toUpperCase()
              }
            </div>
            {isOwn && (
              <>
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition"
                >
                  <Camera size={12} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Prénom" />
                  <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Nom" />
                </div>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={500} placeholder="Votre bio..." className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={updateMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition">
                    {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Enregistrer
                  </button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <X size={12} /> Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile.pseudonyme}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color} ${badge.bg}`}>
                    {badge.label}
                  </span>
                  {profile.role && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {profile.role.role_name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile.first_name} {profile.last_name}</p>
                {profile.email && isOwn && <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>}
                {profile.bio ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{profile.bio}</p>
                ) : isOwn ? (
                  <p className="text-sm text-gray-400 mt-2 italic">Ajoutez une bio pour vous présenter...</p>
                ) : null}
                {isOwn && (
                  <button onClick={startEdit} className="mt-3 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    <Edit3 size={12} /> Modifier le profil
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.publications_count || 0}</p>
            <p className="text-xs text-gray-500">Publications</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.comments_count || 0}</p>
            <p className="text-xs text-gray-500">Commentaires</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Award size={20} className="text-amber-500" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{profile.points_solidarite || 0}</p>
            </div>
            <p className="text-xs text-gray-500">Points solidarité</p>
          </div>
        </div>
      </div>

      {/* Membre depuis */}
      <p className="text-center text-xs text-gray-400">
        Membre depuis {profile.created_at && formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: fr })}
      </p>
    </div>
  );
}
