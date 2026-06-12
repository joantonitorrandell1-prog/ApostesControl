import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../adapters/db/drizzle/connection';
import * as schema from '../adapters/db/drizzle/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // Don't auto login after creation (so user logs in explicitly)
    requireEmailVerification: false, // Allow login even if email is not verified
  },
  // Define custom fields that we added to our database
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
