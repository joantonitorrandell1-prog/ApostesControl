'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SportDTO, CompetitionDTO, DashboardSummary } from '@/@types/contract';
import { 
  Trophy, Plus, Folder, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Percent, Hourglass, Check, X, Calendar, 
  ArrowLeft, Trash2, FolderMinus 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Lazy load Recharts
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function SportPage({ params }: { params: { sportId: string } }) {
  const { sportId } = params;
  const router = useRouter();
  
  const [sport, setSport] = useState<SportDTO | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionDTO[]>([]);
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  
  // Creation state
  const [newCompName, setNewCompName] = useState('');
  const [showAddComp, setShowAddComp] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sportData = await apiClient<SportDTO>(`/api/sports/${sportId}`);
      const compsData = await apiClient<CompetitionDTO[]>(`/api/competitions?sportId=${sportId}`);
      const statsData = await apiClient<DashboardSummary>(`/api/stats?filter=${filter}&sportId=${sportId}`);
      
      setSport(sportData);
      setCompetitions(compsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load sport detail data', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, sportId]);

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    setActionLoading(true);
    try {
      const created = await apiClient<CompetitionDTO>('/api/competitions', {
        method: 'POST',
        body: JSON.stringify({ name: newCompName, sportId }),
      });
      setCompetitions([...competitions, created]);
      setNewCompName('');
      setShowAddComp(false);

      // Refresh statistics
      const statsData = await apiClient<DashboardSummary>(`/api/stats?filter=${filter}&sportId=${sportId}`);
      setStats(statsData);
    } catch (err) {
      alert('Error creant la competició');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSport = async () => {
    if (!confirm('Estàs segur que vols eliminar aquesta secció d\'esport? S\'eliminaran totes les competicions i apostes associades.')) {
      return;
    }

    try {
      await apiClient(`/api/sports/${sportId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (err) {
      alert('Error eliminant l\'esport');
    }
  };

  if (loading && !sport) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-t-accent-cyan border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isProfit = stats ? stats.netProfit >= 0 : true;

  return (
    <div className="space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition w-fit">
          <ArrowLeft className="w-4 h-4" />
          <span>Tornar al Dashboard</span>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-accent-cyan">{sport?.name}</span>
              <span className="text-slate-500 font-normal">/ Secció</span>
            </h1>
            <p className="text-slate-400 mt-1">Estadístiques de rendiment i carpetes d'esdeveniments per a {sport?.name}.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteSport}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-950/20 border border-accent-red/20 hover:border-accent-red/60 text-accent-red rounded-xl text-xs font-bold transition duration-300"
              title="Eliminar secció"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Secció</span>
            </button>
            
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-border rounded-xl">
              {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter === p ? 'bg-accent-cyan text-background' : 'text-slate-400 hover:text-white'}`}
                >
                  {p === 'daily' ? 'Diari' : p === 'monthly' ? 'Mensual' : 'Anual'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Widget Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Invertit</span>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-300">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-white">{stats.totalInvested.toFixed(2)} €</h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Ganàncies Totals</span>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-accent-green">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-accent-green">{stats.totalEarnings.toFixed(2)} €</h3>
            </div>
          </div>

          <div className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${isProfit ? 'border-accent-green/20 glow-green' : 'border-accent-red/20 glow-red'}`}>
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Balanç Net</span>
              <div className={`w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center ${isProfit ? 'text-accent-green' : 'text-accent-red'}`}>
                {isProfit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-bold ${isProfit ? 'text-accent-green' : 'text-accent-red'}`}>
                {isProfit ? '+' : ''}{stats.netProfit.toFixed(2)} €
              </h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">ROI i Win Rate</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-0.5">
                  {stats.roi.toFixed(1)}<Percent className="w-3 h-3 text-slate-500" />
                </h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ROI</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-0.5">
                  {stats.winRate.toFixed(1)}<Percent className="w-3 h-3 text-slate-500" />
                </h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Chart Section */}
      <div className="glass-panel p-6 rounded-2xl border border-border">
        <h2 className="text-lg font-bold text-white mb-6">Balanç Net en {sport?.name} ({filter})</h2>
        <div className="h-64 w-full">
          {mounted && stats && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetSport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isProfit ? '#10b981' : '#f43f5e'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={isProfit ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(8, 17, 40, 0.9)', borderColor: 'rgba(255,255,255,0.1)' }} 
                  labelClassName="text-slate-400 font-medium text-xs mb-1"
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  name="Balanç Net (€)"
                  stroke={isProfit ? '#10b981' : '#f43f5e'} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorNetSport)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No hi ha dades suficients en aquest esport per mostrar el gràfic.
            </div>
          )}
        </div>
      </div>

      {/* Competitions Folders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-accent-cyan" />
            <span>Competicions (Carpetes)</span>
          </h2>
          <button
            onClick={() => setShowAddComp(!showAddComp)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-border hover:border-accent-cyan/40 hover:text-accent-cyan rounded-xl text-xs font-bold transition duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Carpeta</span>
          </button>
        </div>

        {/* Add Folder form */}
        {showAddComp && (
          <form onSubmit={handleCreateCompetition} className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col sm:flex-row gap-4 items-end sm:items-center animate-fadeIn">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom de la Carpeta (Competició)</label>
              <input
                type="text"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                placeholder="Ex: Champions League, NBA Playoffs, LaLiga"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-border rounded-xl focus:border-accent-cyan focus:outline-none text-white text-sm"
                required
                disabled={actionLoading}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowAddComp(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-border hover:bg-slate-900 text-slate-300 text-xs font-semibold"
                disabled={actionLoading}
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-accent-cyan hover:bg-cyan-600 disabled:opacity-50 text-background font-bold rounded-xl text-xs transition duration-300"
                disabled={actionLoading}
              >
                {actionLoading ? 'Creant...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

        {/* Competitions Cards list */}
        {competitions.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-border/40 text-slate-500">
            Aquesta secció encara no conté cap carpeta (competició). Comença afegint-ne una!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {competitions.map((comp) => (
              <div key={comp.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-accent-cyan/25 hover:glow-cyan flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-400 group-hover:text-accent-cyan transition duration-300">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-accent-cyan transition">{comp.name}</h3>
                    <p className="text-xs text-slate-500">Carpeta de competició</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link
                    href={`/sports/${sportId}/competitions/${comp.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-accent-cyan transition duration-200"
                  >
                    <span>Obrir carpeta</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
