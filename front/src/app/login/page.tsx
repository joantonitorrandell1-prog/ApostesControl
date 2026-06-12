'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Trophy, Mail, Lock, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('resetSuccess') === 'true') {
        setSuccessMsg('Contrasenya actualitzada correctament! Inicia sessió amb la nova contrasenya.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Si us plau, introdueix el correu i la contrasenya.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Error de credencials.');
      } else {
        router.refresh(); // Triggers the layout check to redirect appropriately
      }
    } catch (err: any) {
      setError('No s\'ha pogut connectar amb el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-green/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-border glow-green relative z-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-accent-green animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
            APOSTES<span className="text-accent-green">CONTROL</span>
          </h1>
          <p className="text-slate-400 text-sm">Gestiona la teva activitat de forma professional</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/20 border border-accent-red/30 text-accent-red text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/20 border border-accent-green/30 text-accent-green text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correu Electrònic</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-border rounded-xl focus:border-accent-green focus:outline-none text-white placeholder-slate-500 transition duration-300"
                placeholder="nom@exemple.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contrasenya</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-border rounded-xl focus:border-accent-green focus:outline-none text-white placeholder-slate-500 transition duration-300"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-green hover:bg-emerald-600 disabled:bg-emerald-800 disabled:opacity-50 text-background font-bold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] mt-2"
          >
            {loading ? 'Iniciant sessió...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} APOSTESCONTROL. Tots els drets reservats.</p>
        </div>
      </div>
    </div>
  );
}
