'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-accent-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
}
