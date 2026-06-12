"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betRelations = exports.competitionRelations = exports.sportRelations = exports.userRelations = exports.bet = exports.competition = exports.sport = exports.verification = exports.account = exports.session = exports.user = exports.betStatusEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Role Enum
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['ADMIN', 'USER']);
// Status Enum for Bets
exports.betStatusEnum = (0, pg_core_1.pgEnum)('bet_status', ['WON', 'LOST', 'PENDING']);
// --- BETTER AUTH REQUIRED TABLES ---
exports.user = (0, pg_core_1.pgTable)('user', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false).notNull(),
    image: (0, pg_core_1.text)('image'),
    role: (0, exports.roleEnum)('role').default('USER').notNull(),
    requirePasswordChange: (0, pg_core_1.boolean)('require_password_change').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.session = (0, pg_core_1.pgTable)('session', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.user.id, { onDelete: 'cascade' }),
    token: (0, pg_core_1.text)('token').notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.account = (0, pg_core_1.pgTable)('account', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.user.id, { onDelete: 'cascade' }),
    accountId: (0, pg_core_1.text)('account_id').notNull(),
    providerId: (0, pg_core_1.text)('provider_id').notNull(),
    accessToken: (0, pg_core_1.text)('access_token'),
    refreshToken: (0, pg_core_1.text)('refresh_token'),
    idToken: (0, pg_core_1.text)('id_token'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    password: (0, pg_core_1.text)('password'), // Used for credentials auth (contains hashed password)
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.verification = (0, pg_core_1.pgTable)('verification', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    identifier: (0, pg_core_1.text)('identifier').notNull(),
    value: (0, pg_core_1.text)('value').notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// --- DOMAIN TABLES ---
exports.sport = (0, pg_core_1.pgTable)('sport', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.user.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.competition = (0, pg_core_1.pgTable)('competition', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    sportId: (0, pg_core_1.text)('sport_id').notNull().references(() => exports.sport.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.bet = (0, pg_core_1.pgTable)('bet', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.user.id, { onDelete: 'cascade' }),
    competitionId: (0, pg_core_1.text)('competition_id').notNull().references(() => exports.competition.id, { onDelete: 'cascade' }),
    amount: (0, pg_core_1.doublePrecision)('amount').notNull(), // Float: Money invested
    odds: (0, pg_core_1.doublePrecision)('odds').notNull(), // Float: Odds/Quota
    earnings: (0, pg_core_1.doublePrecision)('earnings').default(0).notNull(), // Float: Earnings (0 if lost or pending)
    isBonusCredit: (0, pg_core_1.boolean)('is_bonus_credit').default(false).notNull(), // Boolean: was bonus credit used?
    status: (0, exports.betStatusEnum)('status').default('PENDING').notNull(), // WON, LOST, PENDING
    date: (0, pg_core_1.timestamp)('date').defaultNow().notNull(), // Date of the bet
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// --- RELATIONSHIPS ---
exports.userRelations = (0, drizzle_orm_1.relations)(exports.user, ({ many }) => ({
    sessions: many(exports.session),
    accounts: many(exports.account),
    sports: many(exports.sport),
    bets: many(exports.bet),
}));
exports.sportRelations = (0, drizzle_orm_1.relations)(exports.sport, ({ one, many }) => ({
    user: one(exports.user, { fields: [exports.sport.userId], references: [exports.user.id] }),
    competitions: many(exports.competition),
}));
exports.competitionRelations = (0, drizzle_orm_1.relations)(exports.competition, ({ one, many }) => ({
    sport: one(exports.sport, { fields: [exports.competition.sportId], references: [exports.sport.id] }),
    bets: many(exports.bet),
}));
exports.betRelations = (0, drizzle_orm_1.relations)(exports.bet, ({ one }) => ({
    user: one(exports.user, { fields: [exports.bet.userId], references: [exports.user.id] }),
    competition: one(exports.competition, { fields: [exports.bet.competitionId], references: [exports.competition.id] }),
}));
