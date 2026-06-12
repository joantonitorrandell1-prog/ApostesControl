'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import { Trophy, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Si us plau, omple tots els camps.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contrasenya ha de tenir un mínim de 6 caràcters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les contrasenyes no coincideixen.');
      return;
    }

    setLoading(true);

    try {
      // Call the hexagonal backend endpoint to update the password and set requirePasswordChange = false
      await apiClient('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      // Session needs to be re-authenticated to clear cookies and get a fresh token. Sign out first.
      await authClient.signOut();
      
      // Redirect to login with success indicator
      router.push('/login?resetSuccess=true');
    } catch (err: any) {
      setError(err.message || 'No s\'ha pogut canviar la contrasenya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-border relative z-10 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Lock className="w-7 h-7 text-accent-gold" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-2">
            Canvi de contrasenya obligatori
          </h1>
          <p className="text-slate-400 text-sm text-center">
            Per seguretat, has de canviar la contrasenya temporal abans de poder accedir al teu panell.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/20 border border-accent-red/30 text-accent-red text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nova Contrasenya</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-border rounded-xl focus:border-accent-gold focus:outline-none text-white placeholder-slate-600 transition"
                placeholder="Introduïu nova contrasenya"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirma la Contrasenya</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-border rounded-xl focus:border-accent-gold focus:outline-none text-white placeholder-slate-600 transition"
                placeholder="Repetiu la contrasenya"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-gold hover:bg-amber-600 disabled:bg-amber-800 disabled:opacity-50 text-background font-bold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] mt-2"
          >
            {loading ? 'Guardant contrasenya...' : 'Canviar Contrasenya'}
          </button>
        </form>
      </div>
    </div>
  );
}
