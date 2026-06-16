import { useEffect, useState } from 'react';
import { createAuthClient } from 'better-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apostes-control-back.vercel.app';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export const authClient = createAuthClient({
  baseURL: API_URL,
});

export async function fetchSession() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/auth/get-session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export function useSession() {
  const [data, setData] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetchSession().then((session) => {
      setData(session);
      setIsPending(false);
    });
  }, []);

  return { data, isPending };
}

export async function signOut() {
  const token = getToken();
  if (token) {
    await fetch(`${API_URL}/api/auth/sign-out`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
