import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/betting_db';

export const pool = new Pool({
  connectionString,
  max: 3,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
