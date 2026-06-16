'use client';

import React, { useState, useEffect, use } from 'react';
import { apiClient } from '@/lib/api-client';
import { SportDTO, CompetitionDTO, DashboardSummary } from '@/@types/contract';
import { 
  Trophy, Plus, Folder, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Percent, Calendar, ArrowLeft, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function SportPage({ params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = use(params);
  const router = useRouter();
  
  const [sport, setSport] = useState<SportDTO | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionDTO[]>([]);
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  
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

      const statsData = await apiClient<DashboardSummary>(`/api/stats?filter=${filter}&sportId=${sportId}`);
      setStats(statsData);
    } catch (err) {
      alert('Error creant la competició');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSport = async () => {
    if (!confirm("Estàs segur que vols eliminar aquesta secció? S'eliminaran de forma irreversible totes les carpetes i apostes vinculades.")) {
      return;
    }

    try {
      await apiClient(`/api/sports/${sportId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (err) {
      alert("Error eliminant l'esport");
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
  const yieldValue = stats && stats.totalInvested > 0 ? (stats.netProfit / stats.totalInvested) * 100 : 0;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-slate-200">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition w-fit">
          <ArrowLeft className="w-4 h-4" />
          <span>Tornar al Resum General</span>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-accent-cyan">{sport?.name}</span>
              <span className="text-slate-500 font-normal">/ Panell Mètric</span>
            </h1>
            <p className="text-slate-400 mt-1">Gestió de carpetes de l'esport i avaluació de yield de mercat.</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              onClick={handleDeleteSport}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/20 border border-rose-500/20 hover:border-rose-500 text-rose-400 rounded-xl text-xs font-bold transition duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Secció</span>
            </button>
            
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter === p ? 'bg-accent-cyan text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {p === 'daily' ? 'Diari' : p === 'monthly' ? 'Mensual' : 'Anual'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Invertit en {sport?.name}</span>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-white">{stats.totalInvested.toFixed(2)} €</h3>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Benefici Net</span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isProfit ? 'text-accent-green bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-bold ${isProfit ? 'text-accent-green' : 'text-rose-500'}`}>
                {isProfit ? '+' : ''}{stats.netProfit.toFixed(2)} €
              </h3>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Yield Específic</span>
              <TrendingUp className="w-4 h-4 text-accent-cyan" />
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-bold ${yieldValue >= 0 ? 'text-accent-cyan' : 'text-rose-400'}`}>
                {yieldValue.toFixed(2)}%
              </h3>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
              <Percent className="w-4 h-4 text-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <h4 className="text-xl font-bold text-white">{stats.winRate.toFixed(1)}%</h4>
              </div>
              <div className="text-right text-xs text-slate-400 self-end">
                {stats.wonCount}G - {stats.lostCount}P
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-6">Rendiment Financer a {sport?.name}</h2>
        <div className="h-64 w-full">
          {mounted && stats && stats.chartData?.length > 0 ? (
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
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} 
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
              Manca d'apostes tancades en aquest bloc d'esport.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-accent-cyan" />
            <span>Competicions / Carpetes Actives</span>
          </h2>
          <button
            onClick={() => setShowAddComp(!showAddComp)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-accent-cyan/40 hover:text-accent-cyan rounded-xl text-xs font-bold transition duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Carpeta</span>
          </button>
        </div>

        {showAddComp && (
          <form onSubmit={handleCreateCompetition} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom de la Carpeta (Competició)</label>
              <input
                type="text"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                placeholder="Ex: Champions League, NBA, Roland Garros"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-cyan focus:outline-none text-white text-sm"
                required
                disabled={actionLoading}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowAddComp(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-semibold"
                disabled={actionLoading}
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-accent-cyan hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition duration-300"
                disabled={actionLoading}
              >
                {actionLoading ? 'Creant...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

        {competitions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-slate-800 text-slate-500">
            Aquesta secció de mercat encara no té cap subcarpeta de competició.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {competitions.map((comp) => (
              <div key={comp.id} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-accent-cyan/25 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent-cyan transition duration-300">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-accent-cyan transition">{comp.name}</h3>
                    <p className="text-xs text-slate-500">Carpeta operativa</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Link
                    href={`/sports/${sportId}/competitions/${comp.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-accent-cyan transition duration-200"
                  >
                    <span>Obrir bloc d'apostes</span>
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