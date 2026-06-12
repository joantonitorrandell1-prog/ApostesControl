"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const better_auth_config_1 = require("../../../config/better-auth.config");
async function requireAuth(req, res, next) {
    try {
        const session = await better_auth_config_1.auth.api.getSession({
            headers: new Headers(req.headers),
        });
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = session.user;
        req.session = session.session;
        // Strict backend enforcement: if password change is required, only allow changing password
        if (req.user?.requirePasswordChange && !req.path.endsWith('/change-password')) {
            return res.status(403).json({
                error: 'Password change required',
                code: 'PASSWORD_CHANGE_REQUIRED',
            });
        }
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
}
