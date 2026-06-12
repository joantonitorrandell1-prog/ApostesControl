'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { UserDTO, CreateUserResponse } from '@/@types/contract';
import { 
  Shield, Plus, Trash2, Mail, User, ShieldCheck, 
  Key, Copy, Check, CheckCircle2, UserCheck, X
} from 'lucide-react';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creation state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Success dialog (temporary password display)
  const [createdResult, setCreatedResult] = useState<CreateUserResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient<UserDTO[]>('/api/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setActionLoading(true);
    try {
      const result = await apiClient<CreateUserResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, role }),
      });
      
      setCreatedResult(result);
      setUsers([...users, result.user]);
      setName('');
      setEmail('');
      setRole('USER');
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Error creant l\'usuari');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Estàs segur que vols eliminar aquest usuari? Aquesta acció és irreversible.')) {
      return;
    }

    try {
      await apiClient(`/api/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message || 'Error eliminant l\'usuari');
    }
  };

  const handleCopyPassword = () => {
    if (createdResult?.temporaryPassword) {
      navigator.clipboard.writeText(createdResult.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-t-accent-indigo border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-accent-indigo" />
            <span>Gestió d'Usuaris</span>
          </h1>
          <p className="text-slate-400 mt-1">Crea i administra els usuaris i els seus rols d'accés.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-indigo hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition duration-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        >
          <Plus className="w-4 h-4" />
          <span>Afegir Usuari</span>
        </button>
      </div>

      {/* Success Modal for Temporary Password */}
      {createdResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-accent-indigo glow-indigo relative animate-scaleUp">
            <button 
              onClick={() => setCreatedResult(null)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center gap-3 mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-950/40 border border-accent-indigo/40 flex items-center justify-center text-accent-indigo">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Usuari creat amb èxit!</h2>
              <p className="text-xs text-slate-400">Envia aquestes credencials temporals a l'usuari perquè pugui entrar per primera vegada.</p>
            </div>

            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-border">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nom</p>
                <p className="text-sm font-semibold text-white">{createdResult.user.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-white">{createdResult.user.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contrasenya Temporal</p>
                <div className="flex items-center justify-between gap-2 bg-slate-900 border border-border px-3 py-2 rounded-lg mt-1">
                  <span className="font-mono text-sm text-accent-indigo font-bold">{createdResult.temporaryPassword}</span>
                  <button
                    onClick={handleCopyPassword}
                    className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Copiar contrasenya"
                  >
                    {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCreatedResult(null)}
              className="w-full py-2.5 bg-accent-indigo hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 text-sm transition"
            >
              Tancar i continuar
            </button>
          </div>
        </div>
      )}

      {/* Creation form */}
      {showAddForm && (
        <form onSubmit={handleCreateUser} className="glass-panel p-6 rounded-2xl border border-border space-y-4 animate-fadeIn">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-indigo" />
            <span>Afegir nou usuari</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Joan Pere"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-border rounded-xl focus:border-accent-indigo focus:outline-none text-white text-sm"
                  required
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correu Electrònic</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-border rounded-xl focus:border-accent-indigo focus:outline-none text-white text-sm"
                  required
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol d'Accés</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-950/80 border border-border rounded-xl focus:border-accent-indigo focus:outline-none text-white text-sm"
                disabled={actionLoading}
              >
                <option value="USER">USER (Gestió d'apostes)</option>
                <option value="ADMIN">ADMIN (Gestió d'usuaris i tot)</option>
              </select>
            </div>
          </div>

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
              className="px-6 py-2 bg-accent-indigo hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition duration-300"
              disabled={actionLoading}
            >
              {actionLoading ? 'Creant...' : 'Invitar Usuari'}
            </button>
          </div>
        </form>
      )}

      {/* Users list table */}
      <div className="glass-panel rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/80 bg-slate-900/20">
          <h2 className="text-lg font-bold text-white">Llistat d'Usuaris Registrats</h2>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No hi ha cap usuari registrat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-200">
              <thead className="bg-slate-950/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Nom</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Rol</th>
                  <th className="px-6 py-3.5">Canvi Password</th>
                  <th className="px-6 py-3.5">Data Creació</th>
                  <th className="px-6 py-3.5 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/25 transition">
                    <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                    <td className="px-6 py-4 text-slate-300">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-indigo-950/60 text-accent-indigo border border-accent-indigo/20' : 'bg-slate-950/60 text-slate-400 border border-border'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.requirePasswordChange ? (
                        <span className="flex items-center gap-1.5 text-xs text-accent-gold font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse"></span>
                          Pendent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-accent-green font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
                          Completat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('ca-ES')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== 'usr_admin' ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-accent-red hover:bg-rose-950/20 transition-all duration-200"
                          title="Eliminar usuari"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-600 italic">Sancionat</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
