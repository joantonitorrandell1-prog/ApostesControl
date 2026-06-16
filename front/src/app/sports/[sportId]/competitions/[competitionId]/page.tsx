'use client';

import React, { useState, useEffect, use } from 'react';
import { apiClient } from '@/lib/api-client';
import { SportDTO, CompetitionDTO, BetDTO, BetStatus } from '@/@types/contract';
import { 
  Trophy, Plus, Trash2, Calendar, Link as LinkIcon, Edit2, Check,
  HelpCircle, CheckCircle, XCircle, AlertCircle, Percent,
  Coins, Sparkles, BookOpen, Star, ShieldAlert, ArrowLeft, Ban, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CompetitionPage({ 
  params 
}: { 
  params: Promise<{ sportId: string; competitionId: string }> 
}) {
  const { sportId, competitionId } = use(params);
  const router = useRouter();

  const [sport, setSport] = useState<SportDTO | null>(null);
  const [competition, setCompetition] = useState<CompetitionDTO | null>(null);
  const [bets, setBets] = useState<BetDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [pick, setPick] = useState('');
  const [bookmaker, setBookmaker] = useState('');
  const [amount, setAmount] = useState('');
  const [odds, setOdds] = useState('');
  const [stake, setStake] = useState('1');
  const [betType, setBetType] = useState<'SIMPLE' | 'COMBINADA'>('SIMPLE');
  const [isBonusCredit, setIsBonusCredit] = useState(false);
  const [status, setStatus] = useState<BetStatus | 'VOID' | 'CASH_OUT'>('PENDING');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingBetId, setEditingBetId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editOdds, setEditOdds] = useState('');
  const [editPick, setEditPick] = useState('');

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
    const parsedStake = parseFloat(stake);
    const parsedCashOut = parseFloat(cashOutAmount);

    if (!pick.trim()) {
      alert('Si us plau, especifica quina selecció o Pronòstic fas.');
      return;
    }
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
          pick,
          bookmaker: bookmaker || 'Desconeguda',
          amount: parsedAmount,
          odds: parsedOdds,
          stake: parsedStake,
          type: betType,
          isBonusCredit,
          status: status === 'VOID' || status === 'CASH_OUT' ? 'PENDING' : status,
          customStatus: status,
          cashOutAmount: status === 'CASH_OUT' ? parsedCashOut : null,
          date: new Date(date).toISOString(),
        }),
      });

      setBets([created, ...bets]);
      setPick('');
      setBookmaker('');
      setAmount('');
      setOdds('');
      setStake('1');
      setIsBonusCredit(false);
      setStatus('PENDING');
      setCashOutAmount('');
      setShowAddForm(false);
    } catch (err) {
      alert("Error creant l'aposta");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBet = async (betId: string) => {
    if (!confirm('Estàs segur que vols eliminar aquesta aposta?')) return;
    try {
      await apiClient(`/api/bets/${betId}`, { method: 'DELETE' });
      setBets(bets.filter(b => b.id !== betId));
    } catch (err) {
      alert("Error eliminant l'aposta");
    }
  };

  const handleUpdateStatus = async (betId: string, newStatus: any) => {
    try {
      const updated = await apiClient<BetDTO>(`/api/bets/${betId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setBets(bets.map(b => b.id === betId ? updated : b));
    } catch (err) {
      alert("Error actualitzant l'estat de l'aposta");
    }
  };

  const startInlineEdit = (bet: BetDTO) => {
    setEditingBetId(bet.id);
    setEditAmount(bet.amount.toString());
    setEditOdds(bet.odds.toString());
    setEditPick((bet as any).pick || '');
  };

  const saveInlineEdit = async (betId: string) => {
    const parsedAmount = parseFloat(editAmount);
    const parsedOdds = parseFloat(editOdds);

    if (isNaN(parsedAmount) || isNaN(parsedOdds) || parsedAmount <= 0 || parsedOdds <= 1) {
      alert('Valors numèrics invàlids.');
      return;
    }

    try {
      const updated = await apiClient<BetDTO>(`/api/bets/${betId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          amount: parsedAmount,
          odds: parsedOdds,
          pick: editPick
        }),
      });
      setBets(bets.map(b => b.id === betId ? updated : b));
      setEditingBetId(null);
    } catch (err) {
      alert("Error modificant l'aposta");
    }
  };

  if (loading && !competition) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-t-accent-cyan border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-slate-200">
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
            <span>{competition?.name}</span>
            <span className="text-slate-500 font-normal">/ Registre</span>
          </h1>
          <p className="text-slate-400 mt-1">Full d'anàlisi de apostes amb stakeholders, tipologies i rendibilitat.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-green hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition duration-300 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Afegir Nova Aposta</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateBet} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-green" />
            <span>Especificacions del Pick / Inversió</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pronòstic / Pick / Selecció</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={pick}
                  onChange={(e) => setPick(e.target.value)}
                  placeholder="Ex: Real Madrid -1.5 Handicap"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Casa d'apostes (Bookie)</label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={bookmaker}
                  onChange={(e) => setBookmaker(e.target.value)}
                  placeholder="Ex: Bet365, Winamax, Betfair"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipus d'Aposta</label>
              <select
                value={betType}
                onChange={(e) => setBetType(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
              >
                <option value="SIMPLE">Aposta Simple</option>
                <option value="COMBINADA">Aposta Combinada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Import Cost (€)</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="20.00"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quota decimal</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.001"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  placeholder="1.95"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stake (Confiança 1-10)</label>
              <select
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>Stake {i+1}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estat Inversió</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
              >
                <option value="PENDING">PENDENT</option>
                <option value="WON">GUANYADA</option>
                <option value="LOST">PERDUDA</option>
                <option value="VOID">VOID / NUL·LA</option>
                <option value="CASH_OUT">CASH OUT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Execució</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBonusCredit}
                  onChange={(e) => setIsBonusCredit(e.target.checked)}
                  className="w-4 h-4 accent-accent-green border-slate-800 rounded cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Utilitza crèdit de Bo / Freebet
                </span>
              </label>

              {status === 'CASH_OUT' && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Import rebut Cashout (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                    placeholder="12.50"
                    className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-white text-xs w-28"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-semibold"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-accent-green hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition duration-300"
                disabled={actionLoading}
              >
                Desar Registre
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/20">
          <h2 className="text-lg font-bold text-white">Full de Càlcul Històric</h2>
        </div>

        {bets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Manca d'apostes introduïdes en aquesta carpeta.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200 border-collapse">
              <thead className="bg-slate-950/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Data i Bookie</th>
                  <th className="px-6 py-3.5">Tipus / Pick</th>
                  <th className="px-6 py-3.5">Import</th>
                  <th className="px-6 py-3.5">Quota</th>
                  <th className="px-6 py-3.5">Stake</th>
                  <th className="px-6 py-3.5">Estat Inversió</th>
                  <th className="px-6 py-3.5">Balanç Net</th>
                  <th className="px-6 py-3.5 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bets.map((b) => {
                  const isEditing = editingBetId === b.id;
                  
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      <HelpCircle className="w-3.5 h-3.5" /> Pendent
                    </span>
                  );
                  if (b.status === 'WON') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-accent-green border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Encertada
                      </span>
                    );
                  } else if (b.status === 'LOST') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Fallada
                      </span>
                    );
                  } else if ((b as any).status === 'VOID') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        <Ban className="w-3.5 h-3.5" /> Nul·la
                      </span>
                    );
                  } else if ((b as any).status === 'CASH_OUT') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <DollarSign className="w-3.5 h-3.5" /> Cash Out
                      </span>
                    );
                  }

                  return (
                    <tr key={b.id} className="hover:bg-slate-900/10 transition align-middle">
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-400">{new Date(b.date).toLocaleDateString('ca-ES')}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-tight">{(b as any).bookmaker || 'Bet365'}</div>
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPick}
                            onChange={(e) => setEditPick(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full"
                          />
                        ) : (
                          <>
                            <div className="font-semibold text-white text-sm">{(b as any).pick || 'Sense descripció'}</div>
                            <div className="text-[10px] text-slate-500 font-bold">{(b as any).type || 'SIMPLE'} {b.isBonusCredit && '• (Bo)'}</div>
                          </>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-white">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white w-20"
                          />
                        ) : (
                          <span>{b.amount.toFixed(2)} €</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-300">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editOdds}
                            onChange={(e) => setEditOdds(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white w-16"
                          />
                        ) : (
                          <span>{b.odds.toFixed(2)}</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold bg-slate-950 px-2 py-1 border border-slate-800 rounded-md text-amber-500">
                          {(b as any).stake || 1}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {badge}
                          {b.status === 'PENDING' && !isEditing && (
                            <div className="flex gap-1 animate-fadeIn">
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'WON')}
                                className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-accent-green hover:text-accent-green text-[10px] font-bold"
                              >
                                Guanyat
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'LOST')}
                                className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-rose-500 hover:text-rose-500 text-[10px] font-bold"
                              >
                                Perdut
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold">
                        {b.status === 'WON' ? (
                          <span className="text-accent-green">+{b.earnings.toFixed(2)} €</span>
                        ) : b.status === 'LOST' ? (
                          <span className="text-rose-500">-{b.amount.toFixed(2)} €</span>
                        ) : (b as any).status === 'VOID' ? (
                          <span className="text-slate-400">0.00 € (Nul·la)</span>
                        ) : (b as any).status === 'CASH_OUT' ? (
                          <span className={((b as any).cashOutAmount - b.amount) >= 0 ? 'text-accent-green' : 'text-rose-500'}>
                            {((b as any).cashOutAmount || 0).toFixed(2)} €
                          </span>
                        ) : (
                          <span className="text-slate-500">0.00 €</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <button
                              onClick={() => saveInlineEdit(b.id)}
                              className="p-1.5 rounded-lg text-accent-green bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                              title="Desar canvis"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => startInlineEdit(b)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                              title="Editar camps"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBet(b.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20"
                            title="Eliminar l'aposta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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