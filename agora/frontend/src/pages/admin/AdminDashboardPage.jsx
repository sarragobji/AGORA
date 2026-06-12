/**
 * L'Agora - Dashboard Admin
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, MessageCircle, Flag, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    select: (res) => res.data.data,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Vue d'ensemble de la plateforme L'Agora</p>
      </div>

      {/* Utilisateurs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Utilisateurs</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total" value={stats?.users?.total} color="bg-indigo-500" />
          <StatCard icon={UserCheck} label="Actifs" value={stats?.users?.active} color="bg-green-500" />
          <StatCard icon={TrendingUp} label="Cette semaine" value={stats?.users?.new_this_week} sub="+nouveaux" color="bg-blue-500" />
          <StatCard icon={TrendingUp} label="Ce mois" value={stats?.users?.new_this_month} sub="+nouveaux" color="bg-cyan-500" />
        </div>
      </div>

      {/* Contenu */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Contenu</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Publications" value={stats?.publications?.total} color="bg-purple-500" />
          <StatCard icon={FileText} label="Cette semaine" value={stats?.publications?.new_this_week} sub="publications" color="bg-violet-500" />
          <StatCard icon={MessageCircle} label="Commentaires" value={stats?.comments?.total} color="bg-pink-500" />
          <StatCard icon={MessageCircle} label="Cette semaine" value={stats?.comments?.new_this_week} sub="commentaires" color="bg-rose-500" />
        </div>
      </div>

      {/* Modération */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Modération</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Flag} label="Signalements totaux" value={stats?.signalements?.total} color="bg-orange-500" />
          <StatCard icon={AlertCircle} label="En attente" value={stats?.signalements?.en_attente} sub="à traiter" color="bg-red-500" />
          <StatCard icon={Flag} label="Validés" value={stats?.signalements?.valides} sub="traités" color="bg-emerald-500" />
        </div>
      </div>

      {/* Alerte signalements en attente */}
      {stats?.signalements?.en_attente > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>{stats.signalements.en_attente} signalement{stats.signalements.en_attente > 1 ? 's' : ''}</strong> en attente de traitement.{' '}
            <a href="/admin/signalements" className="underline font-medium">Traiter maintenant →</a>
          </p>
        </div>
      )}
    </div>
  );
}
