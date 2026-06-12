"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleUserRepository = void 0;
const user_entity_1 = require("../../../../../domain/entities/user.entity");
const connection_1 = require("../connection");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class DrizzleUserRepository {
    async findById(id) {
        const records = await connection_1.db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.id, id)).limit(1);
        if (records.length === 0)
            return null;
        const r = records[0];
        return new user_entity_1.UserEntity(r.id, r.name, r.email, r.role, r.requirePasswordChange, r.createdAt, r.updatedAt);
    }
    async findByEmail(email) {
        const records = await connection_1.db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.email, email)).limit(1);
        if (records.length === 0)
            return null;
        const r = records[0];
        return new user_entity_1.UserEntity(r.id, r.name, r.email, r.role, r.requirePasswordChange, r.createdAt, r.updatedAt);
    }
    async findAll() {
        const records = await connection_1.db.select().from(schema_1.user);
        return records.map(r => new user_entity_1.UserEntity(r.id, r.name, r.email, r.role, r.requirePasswordChange, r.createdAt, r.updatedAt));
    }
    async create(user, passwordHash) {
        await connection_1.db.transaction(async (tx) => {
            // 1. Insert into User Table
            await tx.insert(schema_1.user).values({
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: true,
                role: user.role,
                requirePasswordChange: user.requirePasswordChange,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
            // 2. Insert into BetterAuth Account Table for credentials provider
            const accountId = 'acc_' + Math.random().toString(36).substring(2, 11);
            await tx.insert(schema_1.account).values({
                id: accountId,
                userId: user.id,
                accountId: user.email, // BetterAuth uses email as accountId for credential logins
                providerId: 'credential', // BetterAuth default credentials provider ID is 'credential'
                password: passwordHash,
            });
        });
    }
    async updatePassword(id, passwordHash) {
        // BetterAuth stores credentials passwords in the account table
        await connection_1.db
            .update(schema_1.account)
            .set({ password: passwordHash, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.account.userId, id));
    }
    async updateRequirePasswordChange(id, requirePasswordChange) {
        await connection_1.db
            .update(schema_1.user)
            .set({ requirePasswordChange, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.user.id, id));
    }
    async delete(id) {
        await connection_1.db.delete(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.id, id));
    }
}
exports.DrizzleUserRepository = DrizzleUserRepository;
