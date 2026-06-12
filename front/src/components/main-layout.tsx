'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { LogOut, LayoutDashboard, Shield, Trophy } from 'lucide-react';
import Link from 'next/link';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const isAuthPage = pathname === '/login';
  const isResetPage = pathname === '/reset-password';

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        // Not logged in -> Redirect to login if not already there
        if (!isAuthPage) {
          router.push('/login');
        }
      } else {
        const user = session.user as any;
        // Logged in with temporary password -> Force reset password page
        if (user.requirePasswordChange && !isResetPage) {
          router.push('/reset-password');
        } 
        // Logged in normally -> Prevent login or reset password page access
        else if (!user.requirePasswordChange && (isAuthPage || isResetPage)) {
          router.push('/dashboard');
        }
      }
    }
  }, [session, isPending, pathname, router, isAuthPage, isResetPage]);

  // Loading state with a dark theme spinner
  if (isPending) {
    return (
      <div className="min-height-screen flex items-center justify-center bg-background h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-accent-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Carregant...</p>
        </div>
      </div>
    );
  }

  // Auth pages don't show navigation shell
  if (isAuthPage || isResetPage) {
    return <div className="min-h-screen bg-background text-slate-100">{children}</div>;
  }

  // If no session exists and we are not on login page, prevent rendering UI to avoid flashing
  if (!session) {
    return null;
  }

  const user = session.user as any;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Sleek Top Navbar */}
      <header className="glass-panel border-b border-border py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-wide text-accent-green hover:opacity-95 transition">
              <Trophy className="w-6 h-6 text-accent-green" />
              <span>APOSTES<span className="text-white">CONTROL</span></span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/dashboard" className={`flex items-center gap-1.5 transition ${pathname === '/dashboard' ? 'text-accent-green font-semibold' : 'text-slate-400 hover:text-white'}`}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/dashboard/users" className={`flex items-center gap-1.5 transition ${pathname.startsWith('/dashboard/users') ? 'text-accent-indigo font-semibold' : 'text-slate-400 hover:text-white'}`}>
                  <Shield className="w-4 h-4" />
                  <span>Admin Usuaris</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2.5 rounded-lg bg-slate-900 border border-border hover:bg-rose-950/20 hover:border-accent-red/40 hover:text-accent-red transition-all duration-300"
              title="Tancar sessió"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
