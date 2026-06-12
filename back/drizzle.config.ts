import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/adapters/db/drizzle/schema.ts',
  out: './src/infrastructure/adapters/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/betting_db',
  },
});
