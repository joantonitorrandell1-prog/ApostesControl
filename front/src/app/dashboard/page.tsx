'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SportDTO, DashboardSummary } from '@/@types/contract';
import { 
  Trophy, Plus, Folder, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Percent, Hourglass, Check, X, Calendar 
} from 'lucide-react';
import Link from 'next/link';

// Lazy load Recharts to avoid SSR hydration mismatches
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const [sports, setSports] = useState<SportDTO[]>([]);
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [newSportName, setNewSportName] = useState('');
  const [showAddSport, setShowAddSport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sportsData = await apiClient<SportDTO[]>('/api/sports');
      const statsData = await apiClient<DashboardSummary>(`/api/stats?filter=${filter}`);
      setSports(sportsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSportName.trim()) return;

    setActionLoading(true);
    try {
      const created = await apiClient<SportDTO>('/api/sports', {
        method: 'POST',
        body: JSON.stringify({ name: newSportName }),
      });
      setSports([...sports, created]);
      setNewSportName('');
      setShowAddSport(false);
      
      // Refresh statistics just in case
      const statsData = await apiClient<DashboardSummary>(`/api/stats?filter=${filter}`);
      setStats(statsData);
    } catch (err) {
      alert('Error creant l\'esport');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-t-accent-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isProfit = stats ? stats.netProfit >= 0 : true;

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">El teu Resum d'Activitat</h1>
          <p className="text-slate-400 mt-1">Supervisa les teves inversions i rendiments en apostes esportives.</p>
        </div>
        
        {/* Period Filter Toggles */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-border rounded-xl self-start sm:self-center">
          {(['daily', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition ${filter === p ? 'bg-accent-green text-background' : 'text-slate-400 hover:text-white'}`}
            >
              {p === 'daily' ? 'Diari' : p === 'monthly' ? 'Mensual' : 'Anual'}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Widget Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Total Invested */}
          <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Invertit</span>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-300">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-white">{stats.totalInvested.toFixed(2)} €</h3>
              <p className="text-xs text-slate-500 mt-1">Total de capital apostat</p>
            </div>
          </div>

          {/* Card: Total Earnings */}
          <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Ganàncies Totals</span>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-accent-green">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-accent-green">{stats.totalEarnings.toFixed(2)} €</h3>
              <p className="text-xs text-slate-500 mt-1">Retorn brut rebut</p>
            </div>
          </div>

          {/* Card: Net Profit */}
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
              <p className="text-xs text-slate-500 mt-1">Benefici net (ganància - cost)</p>
            </div>
          </div>

          {/* Card: ROI and Win Rate */}
          <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">ROI i Win Rate</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-0.5">
                  {stats.roi.toFixed(1)}<Percent className="w-3.5 h-3.5 text-slate-500" />
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Retorn inv.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-0.5">
                  {stats.winRate.toFixed(1)}<Percent className="w-3.5 h-3.5 text-slate-500" />
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Apostes guany.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bets status mini panel */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/40 border border-border/60">
          <div className="flex items-center gap-2 justify-center">
            <Hourglass className="w-4 h-4 text-accent-gold" />
            <span className="text-xs font-medium text-slate-300">{stats.pendingCount} Pendents</span>
          </div>
          <div className="flex items-center gap-2 justify-center border-x border-border/60">
            <Check className="w-4 h-4 text-accent-green" />
            <span className="text-xs font-medium text-slate-300">{stats.wonCount} Guanyades</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <X className="w-4 h-4 text-accent-red" />
            <span className="text-xs font-medium text-slate-300">{stats.lostCount} Perdudes</span>
          </div>
        </div>
      )}

      {/* Interactive Chart Section */}
      <div className="glass-panel p-6 rounded-2xl border border-border">
        <h2 className="text-lg font-bold text-white mb-6">Balanç Net over Time ({filter})</h2>
        <div className="h-72 w-full">
          {mounted && stats && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorNet)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No hi ha dades suficients per mostrar el gràfic.
            </div>
          )}
        </div>
      </div>

      {/* Sports Sections Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-accent-cyan" />
            <span>Seccions d'Esports</span>
          </h2>
          <button
            onClick={() => setShowAddSport(!showAddSport)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-border hover:border-accent-cyan/40 hover:text-accent-cyan rounded-xl text-xs font-bold transition duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Secció</span>
          </button>
        </div>

        {/* Create Sport Panel Inline */}
        {showAddSport && (
          <form onSubmit={handleCreateSport} className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col sm:flex-row gap-4 items-end sm:items-center animate-fadeIn">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom del nou Esport</label>
              <input
                type="text"
                value={newSportName}
                onChange={(e) => setNewSportName(e.target.value)}
                placeholder="Ex: Futbol, Bàsquet, Tennis"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-border rounded-xl focus:border-accent-cyan focus:outline-none text-white text-sm"
                required
                disabled={actionLoading}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowAddSport(false)}
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

        {/* Sports list cards */}
        {sports.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-border/40 text-slate-500">
            Encara no has creat cap secció d'esport. Comença creant-ne una!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sports.map((sport) => (
              <div key={sport.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-accent-cyan/30 flex flex-col justify-between hover:glow-cyan hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-accent-cyan">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-accent-cyan transition">{sport.name}</h3>
                    <p className="text-xs text-slate-500">Secció d'esport activa</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link
                    href={`/sports/${sport.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-accent-cyan transition duration-200"
                  >
                    <span>Anar a la secció</span>
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
