import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'better-auth-bridge';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    requirePasswordChange: boolean;
  };
  session?: any;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = session.user as any;
    req.session = session.session;

    // Strict backend enforcement: if password change is required, only allow changing password
    if (req.user?.requirePasswordChange && !req.path.endsWith('/change-password')) {
      return res.status(403).json({
        error: 'Password change required',
        code: 'PASSWORD_CHANGE_REQUIRED',
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
}
