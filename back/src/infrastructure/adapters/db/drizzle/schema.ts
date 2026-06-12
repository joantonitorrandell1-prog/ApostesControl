import { pgTable, text, timestamp, doublePrecision, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Role Enum
export const roleEnum = pgEnum('role', ['ADMIN', 'USER']);

// Status Enum for Bets
export const betStatusEnum = pgEnum('bet_status', ['WON', 'LOST', 'PENDING']);

// --- BETTER AUTH REQUIRED TABLES ---

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: roleEnum('role').default('USER').notNull(),
  requirePasswordChange: boolean('require_password_change').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'), // Used for credentials auth (contains hashed password)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- DOMAIN TABLES ---

export const sport = pgTable('sport', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const competition = pgTable('competition', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sportId: text('sport_id').notNull().references(() => sport.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bet = pgTable('bet', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  competitionId: text('competition_id').notNull().references(() => competition.id, { onDelete: 'cascade' }),
  amount: doublePrecision('amount').notNull(), // Float: Money invested
  odds: doublePrecision('odds').notNull(),     // Float: Odds/Quota
  earnings: doublePrecision('earnings').default(0).notNull(), // Float: Earnings (0 if lost or pending)
  isBonusCredit: boolean('is_bonus_credit').default(false).notNull(), // Boolean: was bonus credit used?
  status: betStatusEnum('status').default('PENDING').notNull(), // WON, LOST, PENDING
  date: timestamp('date').defaultNow().notNull(), // Date of the bet
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- RELATIONSHIPS ---

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  sports: many(sport),
  bets: many(bet),
}));

export const sportRelations = relations(sport, ({ one, many }) => ({
  user: one(user, { fields: [sport.userId], references: [user.id] }),
  competitions: many(competition),
}));

export const competitionRelations = relations(competition, ({ one, many }) => ({
  sport: one(sport, { fields: [competition.sportId], references: [sport.id] }),
  bets: many(bet),
}));

export const betRelations = relations(bet, ({ one }) => ({
  user: one(user, { fields: [bet.userId], references: [user.id] }),
  competition: one(competition, { fields: [bet.competitionId], references: [competition.id] }),
}));
