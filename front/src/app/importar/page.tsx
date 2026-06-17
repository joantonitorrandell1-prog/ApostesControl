'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apostes-control-back.vercel.app';

export default function ImportarPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'importing' | 'done' | 'error' | 'noauth'>('loading');
  const [message, setMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const run = async () => {
      const session = await fetchSession();
      if (!session) {
        setStatus('noauth');
        setMessage('No tens sessió iniciada. Inicia sessió primer.');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');

      if (!dataParam) {
        setStatus('error');
        setMessage('No s\'han rebut dades del marcador.');
        return;
      }

      try {
        const decompress = decodeURIComponent(atob(dataParam));
        const dadesApostes = JSON.parse(decompress);

        if (!Array.isArray(dadesApostes) || dadesApostes.length === 0) {
          setStatus('error');
          setMessage('Les dades rebudes no contenen cap aposta.');
          return;
        }

        setStatus('importing');
        setMessage(`S\'estan important ${dadesApostes.length} apostes...`);

        const token = localStorage.getItem('auth_token');

        const res = await fetch(`${API_URL}/api/apostes/importar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ apostes: dadesApostes }),
        });

        if (res.ok) {
          const data = await res.json();
          setStatus('done');
          setMessage(data.message || `S\'han importat ${dadesApostes.length} apostes correctament`);
        } else if (res.status === 401) {
          setStatus('noauth');
          setMessage('La sessió ha expirat. Inicia sessió de nou.');
        } else {
          const err = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage(err.error || 'Error del servidor en processar les apostes.');
        }
      } catch (e) {
        setStatus('error');
        setMessage('Error en processar les dades rebudes del marcador.');
      }
    };

    run();
  }, []);

  const goToLogin = () => {
    const currentUrl = window.location.href;
    sessionStorage.setItem('importar_return_url', currentUrl);
    setIsRedirecting(true);
    router.push('/login');
  };

  const goToDashboard = () => {
    setIsRedirecting(true);
    router.push('/dashboard');
  };

  const spinner = (
    <div className="w-12 h-12 border-4 border-t-accent-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
  );

  return (
    <div className="min-h-screen bg-background text-slate-100 flex items-center justify-center">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full mx-4 text-center border border-border">
        {isRedirecting ? (
          <>
            {spinner}
            <p className="text-slate-400">Redirigint...</p>
          </>
        ) : status === 'loading' || status === 'importing' ? (
          <>
            {spinner}
            <h2 className="text-xl font-bold mb-2 text-accent-green">Sincronitzant apostes...</h2>
            <p className="text-slate-400">{message || 'Espera un segon, si us plau.'}</p>
          </>
        ) : status === 'done' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4 border border-accent-green/40">
              <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-accent-green">Importació completada</h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <button onClick={goToDashboard} className="w-full py-2.5 px-4 bg-accent-green/20 hover:bg-accent-green/30 border border-accent-green/40 rounded-xl text-accent-green font-semibold transition-all cursor-pointer">
              Anar al Dashboard
            </button>
          </>
        ) : status === 'noauth' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-amber-400">Sessió requerida</h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <button onClick={goToLogin} className="w-full py-2.5 px-4 bg-accent-green/20 hover:bg-accent-green/30 border border-accent-green/40 rounded-xl text-accent-green font-semibold transition-all cursor-pointer">
              Iniciar sessió
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-accent-red/20 flex items-center justify-center mx-auto mb-4 border border-accent-red/40">
              <svg className="w-8 h-8 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-accent-red">Error</h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <button onClick={goToDashboard} className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-border rounded-xl text-slate-300 font-semibold transition-all cursor-pointer">
              Tornar al Dashboard
            </button>
          </>
        )}

        <p className="text-xs text-slate-500 mt-6">
          ApostesControl &copy; 2026
        </p>
      </div>
    </div>
  );
}
