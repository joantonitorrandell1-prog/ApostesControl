const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;

  // Force credentials to ensure session cookies are sent
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Crucial for BetterAuth session cookies
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: 'Unknown API error' };
    }

    // Handle mandatory password change requirement on any route (force redirect)
    if (response.status === 403 && errorData.code === 'PASSWORD_CHANGE_REQUIRED') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/reset-password') {
        window.location.href = '/reset-password';
      }
    }

    // Handle session expiration (Unauthorized)
    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
