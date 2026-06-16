'use client';

import React, { useState, useEffect, use } from 'react';
import { apiClient } from '@/lib/api-client';
import { SportDTO, CompetitionDTO, BetDTO, BetStatus } from '@/@types/contract';
import { 
  Plus, Trash2, Calendar, Edit2, Check, HelpCircle, 
  CheckCircle, XCircle, Percent, Coins, Sparkles, 
  ArrowLeft, Ban, DollarSign, Trophy, ChevronLeft, ChevronRight, Filter
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

  // Filtres de la taula
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Paginació (10 ítems per pàgina)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Estats del formulari d'alta (Simplificat)
  const [matchName, setMatchName] = useState('');
  const [amount, setAmount] = useState('');
  const [odds, setOdds] = useState('');
  const [stake, setStake] = useState('1');
  const [isBonusCredit, setIsBonusCredit] = useState(false);
  const [status, setStatus] = useState<string>('PENDING');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Estats per a l'edició inline
  const [editingBetId, setEditingBetId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editOdds, setEditOdds] = useState('');
  const [editMatch, setEditMatch] = useState('');

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

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, startDateFilter, endDateFilter]);

  const handleCreateBet = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const parsedOdds = parseFloat(odds);
    const parsedStake = parseFloat(stake);
    const parsedCashOut = parseFloat(cashOutAmount);

    if (!matchName.trim()) {
      alert('Si us plau, especifica el Partit / Esdeveniment.');
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
          matchName,
          amount: parsedAmount,
          odds: parsedOdds,
          stake: parsedStake,
          isBonusCredit,
          status: status === 'VOID' || status === 'CASH_OUT' ? 'PENDING' : status,
          customStatus: status,
          cashOutAmount: status === 'CASH_OUT' ? parsedCashOut : null,
          date: new Date(date).toISOString(),
        }),
      });

      setBets([created, ...bets]);
      setMatchName('');
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
    setEditMatch((bet as any).matchName || '');
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
          matchName: editMatch
        }),
      });
      setBets(bets.map(b => b.id === betId ? updated : b));
      setEditingBetId(null);
    } catch (err) {
      alert("Error modificant l'aposta");
    }
  };

  // --- LÒGICA DE FILTRATGE FRONTEND ---
  const filteredBets = bets.filter((b) => {
    if (statusFilter !== 'ALL' && (b.status as string) !== statusFilter) {
      return false;
    }

    const betDateStr = new Date(b.date).toISOString().split('T')[0];

    if (startDateFilter && betDateStr < startDateFilter) {
      return false;
    }

    if (endDateFilter && betDateStr > endDateFilter) {
      return false;
    }

    return true;
  });

  // --- LÒGICA DE PAGINACIÓ ---
  const totalItems = filteredBets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBets = filteredBets.slice(indexOfFirstItem, indexOfLastItem);

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
          <p className="text-slate-400 mt-1">Full d'anàlisi dinàmic d'apostes esportives.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-green hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition duration-300 self-start sm:self-center shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        >
          <Plus className="w-4 h-4" />
          <span>Afegir Nova Aposta</span>
        </button>
      </div>

      {/* Formulari Simplificat */}
      {showAddForm && (
        <form onSubmit={handleCreateBet} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4 animate-fadeIn">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-green" />
            <span>Especificacions de la Inversió</span>
          </h2>

          {/* Fila 1: Només Partit */}
          <div className="space-y-1.5 w-full">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partit / Esdeveniment</label>
            <div className="relative w-full">
              <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                placeholder="Ex: Barcelona vs Real Madrid"
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-accent-green focus:outline-none text-white text-sm"
                required
              />
            </div>
          </div>

          {/* Fila 2: Valors Financers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Import (€)</label>
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
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quota</label>
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
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stake</label>
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
                onChange={(e) => setStatus(e.target.value)}
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
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Utilitza Freebet / Bo
                </span>
              </label>

              {status === 'CASH_OUT' && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Import Cashout (€)</label>
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

      {/* --- BLOC DE FILTRES --- */}
      <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <Filter className="w-4 h-4 text-accent-cyan" />
          <span>Filtres de Cerca</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-3xl">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Filtrar per Estat</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-accent-cyan"
            >
              <option value="ALL">Totes les apostes</option>
              <option value="PENDING">Pendents</option>
              <option value="WON">Guanyades</option>
              <option value="LOST">Perdudes</option>
              <option value="VOID">Void / Nul·les</option>
              <option value="CASH_OUT">Cash Out</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Des de (Data)</span>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Fins a (Data)</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-accent-cyan"
            />
          </div>
        </div>
      </div>

      {/* --- PANEL DE LA TAULA --- */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Full de Càlcul Històric</h2>
          <span className="text-xs text-slate-500 font-medium">Mostrant {currentBets.length} de {totalItems} apostes</span>
        </div>

        {currentBets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Cap aposta coincideix amb els filtres seleccionats.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200 border-collapse">
              <thead className="bg-slate-950/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Data</th>
                  <th className="px-6 py-3.5">Partit / Esdeveniment</th>
                  <th className="px-6 py-3.5">Import</th>
                  <th className="px-6 py-3.5">Quota</th>
                  <th className="px-6 py-3.5">Stake</th>
                  <th className="px-6 py-3.5">Estat Inversió</th>
                  <th className="px-6 py-3.5">Balanç Net</th>
                  <th className="px-6 py-3.5 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentBets.map((b) => {
                  const isEditing = editingBetId === b.id;
                  const currentStatus = b.status as string;

                  return (
                    <tr key={b.id} className="hover:bg-slate-900/10 transition align-middle">
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(b.date).toLocaleDateString('ca-ES')}
                      </td>

                      <td className="px-6 py-4 border-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editMatch}
                            onChange={(e) => setEditMatch(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full"
                            placeholder="Modificar Partit"
                          />
                        ) : (
                          <>
                            <div className="font-semibold text-white text-sm">{(b as any).matchName || 'Partit general'}</div>
                            {b.isBonusCredit && <div className="text-[10px] text-amber-500 font-bold tracking-wide">Saldo de Bo</div>}
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
                        <select
                          value={currentStatus}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border bg-slate-950 cursor-pointer focus:outline-none transition ${
                            currentStatus === 'WON' ? 'text-accent-green border-emerald-500/30' :
                            currentStatus === 'LOST' ? 'text-rose-400 border-rose-500/30' :
                            currentStatus === 'VOID' ? 'text-slate-400 border-slate-700' :
                            'text-amber-500 border-amber-500/30'
                          }`}
                        >
                          <option value="PENDING">PENDENT</option>
                          <option value="WON">GUANYADA</option>
                          <option value="LOST">PERDUDA</option>
                          <option value="VOID">VOID / NUL·LA</option>
                          <option value="CASH_OUT">CASH OUT</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 font-bold">
                        {currentStatus === 'WON' ? (
                          <span className="text-accent-green">+{b.earnings.toFixed(2)} €</span>
                        ) : currentStatus === 'LOST' ? (
                          <span className="text-rose-500">-{b.amount.toFixed(2)} €</span>
                        ) : currentStatus === 'VOID' ? (
                          <span className="text-slate-400">0.00 €</span>
                        ) : currentStatus === 'CASH_OUT' ? (
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
                              className="p-1.5 rounded-lg text-accent-green bg-emerald-500/10 border border-emerald-500/20"
                              title="Desar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => startInlineEdit(b)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBet(b.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20"
                            title="Eliminar"
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

        {/* --- PAGINACIÓ --- */}
        <div className="px-6 py-4 bg-slate-950/20 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-semibold">
            Pàgina {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                      currentPage === pageNum 
                        ? 'bg-accent-cyan text-slate-950 shadow-sm' 
                        : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}