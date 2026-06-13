const { db } = require('../adapters/db/drizzle/connection');
const schema = require('../adapters/db/drizzle/schema');

let authInstance = null;

async function getAuth() {
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
        role: {
          type: 'string',
          defaultValue: 'USER',
        },
        requirePasswordChange: {
          type: 'boolean',
          defaultValue: false,
        },
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
