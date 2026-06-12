'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SportDTO, CompetitionDTO, BetDTO, BetStatus } from '@/@types/contract';
import { 
  Trophy, Plus, Trash2, Calendar, ArrowLeft, 
  HelpCircle, CheckCircle, XCircle, AlertCircle, Percent,
  Coins, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CompetitionPage({ 
  params 
}: { 
  params: { sportId: string; competitionId: string } 
}) {
  const { sportId, competitionId } = params;
  const router = useRouter();

  const [sport, setSport] = useState<SportDTO | null>(null);
  const [competition, setCompetition] = useState<CompetitionDTO | null>(null);
  const [bets, setBets] = useState<BetDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for new bet
  const [amount, setAmount] = useState('');
  const [odds, setOdds] = useState('');
  const [isBonusCredit, setIsBonusCredit] = useState(false);
  const [status, setStatus] = useState<BetStatus>('PENDING');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sportData = await apiClient<SportDTO>(`/api/sports/${sportId}`);
      const compData = await apiClient<CompetitionDTO>(`/api/competitions/${competitionId}`);
      const betsData = await apiClient<BetDTO[]>(`/api/bets?competitionId=${competitionId}`);
      
      setSport(sportData);
      setCompetition(compData);
      setBets(betsData);
    } catch (err) {
      console.error('Failed to load competition data', err);
      router.push(`/sports/${sportId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sportId, competitionId]);

  const handleCreateBet = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const parsedOdds = parseFloat(odds);

    if (isNaN(parsedAmount) || isNaN(parsedOdds) || parsedAmount <= 0 || parsedOdds <= 1) {
      alert('Si us plau, introdueix imports i quotes vàlides.');
      return;
    }

    setActionLoading(true);
    try {
      const created = await apiClient<BetDTO>('/api/bets', {
        method: 'POST',
        body: JSON.stringify({
          competitionId,
          amount: parsedAmount,
          odds: parsedOdds,
          isBonusCredit,
          status,
          date: new Date(date).toISOString(),
        }),
      });

      setBets([created, ...bets]);
      setAmount('');
      setOdds('');
      setIsBonusCredit(false);
      setStatus('PENDING');
      setShowAddForm(false);
    } catch (err) {
      alert('Error creant l\'aposta');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBet = async (betId: string) => {
    if (!confirm('Estàs segur que vols eliminar aquesta aposta?')) {
      return;
    }

    try {
      await apiClient(`/api/bets/${betId}`, { method: 'DELETE' });
      setBets(bets.filter(b => b.id !== betId));
    } catch (err) {
      alert('Error eliminant l\'aposta');
    }
  };

  const handleUpdateStatus = async (betId: string, newStatus: BetStatus) => {
    try {
      const updated = await apiClient<BetDTO>(`/api/bets/${betId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setBets(bets.map(b => b.id === betId ? updated : b));
    } catch (err) {
      alert('Error actualitzant l\'estat de l\'aposta');
    }
  };

  // Preview earnings in real-time
  const getPreviewEarnings = () => {
    const a = parseFloat(amount);
    const o = parseFloat(odds);
    if (isNaN(a) || isNaN(o) || status !== 'WON') return 0;
    const gross = a * o;
    return isBonusCredit ? (gross - a) : gross;
  };

  if (loading && !competition) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-t-accent-cyan border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb trail */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <span>/</span>
          <Link href={`/sports/${sportId}`} className="hover:text-white transition text-accent-cyan">{sport?.name}</Link>
          <span>/</span>
          <span className="text-slate-100">{competition?.name}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-white">{competition?.name}</span>
              <span className="text-slate-500 font-normal">/ Carpeta</span>
            </h1>
            <p className="text-slate-400 mt-1">Gestió d'apostes de la competició i resultats obtinguts.</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-green hover:bg-emerald-600 text-background rounded-xl text-xs font-bold transition duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Afegir Aposta</span>
          </button>
        </div>
      </div>

      {/* Add Bet Form */}
      {showAddForm && (
        <form onSubmit={handleCreateBet} className="glass-panel p-6 rounded-2xl border border-border space-y-4 animate-fadeIn">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-green" />
            <span>Afegir nova aposta</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost / Import (€)</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="20.00"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-border rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                  required
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quota / Odds</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  placeholder="1.85"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-border rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                  required
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estat</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-950/80 border border-border rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                disabled={actionLoading}
              >
                <option value="PENDING">PENDENT</option>
                <option value="WON">GUANYADA</option>
                <option value="LOST">PERDUDA</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Aposta</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-border rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                  required
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 h-full pt-5">
              <input
                type="checkbox"
                id="bonusCheckbox"
                checked={isBonusCredit}
                onChange={(e) => setIsBonusCredit(e.target.checked)}
                className="w-4 h-4 accent-accent-green border-border rounded focus:ring-0 cursor-pointer"
                disabled={actionLoading}
              />
              <label htmlFor="bonusCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer select-none flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                <span>Crèdit Bo</span>
              </label>
            </div>
          </div>

          {/* Realtime earnings preview widget */}
          {status === 'WON' && amount && odds && (
            <div className="bg-emerald-950/10 border border-accent-green/20 p-3.5 rounded-xl text-xs text-accent-green flex items-center justify-between">
              <span>Previsualització guany net:</span>
              <span className="font-bold text-sm">{getPreviewEarnings().toFixed(2)} €</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-border hover:bg-slate-900 text-slate-300 text-xs font-semibold"
              disabled={actionLoading}
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent-green hover:bg-emerald-600 text-background font-bold rounded-xl text-xs transition duration-300"
              disabled={actionLoading}
            >
              {actionLoading ? 'Guardant...' : 'Afegir Aposta'}
            </button>
          </div>
        </form>
      )}

      {/* Bets Listing Panel */}
      <div className="glass-panel rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/80 bg-slate-900/10">
          <h2 className="text-lg font-bold text-white">Apostes Registrades</h2>
        </div>

        {bets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No hi ha cap aposta registrada en aquesta carpeta.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-200">
              <thead className="bg-slate-950/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Data</th>
                  <th className="px-6 py-3.5">Import</th>
                  <th className="px-6 py-3.5">Quota</th>
                  <th className="px-6 py-3.5">Tipus Inversió</th>
                  <th className="px-6 py-3.5">Estat Aposta</th>
                  <th className="px-6 py-3.5">Guany Net</th>
                  <th className="px-6 py-3.5 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {bets.map((b) => {
                  let statusBadge = null;
                  if (b.status === 'WON') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/60 text-accent-green border border-accent-green/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Guanyada</span>
                      </span>
                    );
                  } else if (b.status === 'LOST') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/60 text-accent-red border border-accent-red/20">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Perduda</span>
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/60 text-accent-gold border border-accent-gold/20">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Pendent</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={b.id} className="hover:bg-slate-900/20 transition">
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(b.date).toLocaleDateString('ca-ES')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{b.amount.toFixed(2)} €</td>
                      <td className="px-6 py-4 font-mono text-slate-300">{b.odds.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {b.isBonusCredit ? (
                          <span className="text-xs text-accent-gold font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Crèdit de Bo
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Saldo Reial</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {/* Interactive status selectors */}
                        <div className="flex items-center gap-2">
                          {statusBadge}
                          {b.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'WON')}
                                className="p-1 rounded bg-slate-900 border border-border hover:border-accent-green hover:text-accent-green transition text-[10px] font-bold"
                                title="Marcar com a Guanyada"
                              >
                                W
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'LOST')}
                                className="p-1 rounded bg-slate-900 border border-border hover:border-accent-red hover:text-accent-red transition text-[10px] font-bold"
                                title="Marcar com a Perduda"
                              >
                                L
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {b.status === 'WON' ? (
                          <span className="text-accent-green">+{b.earnings.toFixed(2)} €</span>
                        ) : b.status === 'LOST' ? (
                          <span className="text-accent-red">-{b.amount.toFixed(2)} €</span>
                        ) : (
                          <span className="text-slate-500">0.00 €</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteBet(b.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-accent-red hover:bg-rose-950/20 transition-all duration-200"
                          title="Eliminar aposta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
