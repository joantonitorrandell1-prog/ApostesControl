"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleSportRepository = void 0;
const sport_entity_1 = require("../../../../../domain/entities/sport.entity");
const connection_1 = require("../connection");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class DrizzleSportRepository {
    async findById(id) {
        const records = await connection_1.db.select().from(schema_1.sport).where((0, drizzle_orm_1.eq)(schema_1.sport.id, id)).limit(1);
        if (records.length === 0)
            return null;
        const r = records[0];
        return new sport_entity_1.SportEntity(r.id, r.name, r.userId, r.createdAt);
    }
    async findByUserId(userId) {
        const records = await connection_1.db.select().from(schema_1.sport).where((0, drizzle_orm_1.eq)(schema_1.sport.userId, userId));
        return records.map(r => new sport_entity_1.SportEntity(r.id, r.name, r.userId, r.createdAt));
    }
    async save(sport) {
        const existing = await this.findById(sport.id);
        if (existing) {
            await connection_1.db
                .update(schema_1.sport)
                .set({ name: sport.name })
                .where((0, drizzle_orm_1.eq)(schema_1.sport.id, sport.id));
        }
        else {
            await connection_1.db.insert(schema_1.sport).values({
                id: sport.id,
                name: sport.name,
                userId: sport.userId,
                createdAt: sport.createdAt,
            });
        }
    }
    async delete(id) {
        await connection_1.db.delete(schema_1.sport).where((0, drizzle_orm_1.eq)(schema_1.sport.id, id));
    }
}
exports.DrizzleSportRepository = DrizzleSportRepository;
