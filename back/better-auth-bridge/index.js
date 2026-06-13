// Native JavaScript bridge for better-auth (ESM-only).
// Lives in node_modules (via file: dependency), so esbuild does NOT bundle it.
// Native import() calls are preserved at runtime.

let db, schema;
let authInstance = null;
let initialized = false;

function _requireDb() {
  if (!initialized) {
    db = require('../src/infrastructure/adapters/db/drizzle/connection').db;
    schema = require('../src/infrastructure/adapters/db/drizzle/schema');
    initialized = true;
  }
}

async function getAuth() {
  _requireDb();
  if (authInstance) return authInstance;

  const [{ betterAuth }, { drizzleAdapter }] = await Promise.all([
    import('better-auth'),
    import('better-auth/adapters/drizzle'),
  ]);

  authInstance = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: process.env.BETTER_AUTH_SECRET || 'supersecretbetterauthkey123456789012345',
    baseURL: process.env.BETTER_AUTH_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
    trustedOrigins: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
    ].filter(Boolean),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      requireEmailVerification: false,
    },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'USER' },
        requirePasswordChange: { type: 'boolean', defaultValue: false },
      },
    },
  });

  return authInstance;
}

async function getToNodeHandler() {
  const mod = await import('better-auth/node');
  return mod.toNodeHandler;
}

module.exports = { getAuth, getToNodeHandler };
