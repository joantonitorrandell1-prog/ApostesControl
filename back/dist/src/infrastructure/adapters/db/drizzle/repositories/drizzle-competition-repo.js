"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleCompetitionRepository = void 0;
const competition_entity_1 = require("../../../../../domain/entities/competition.entity");
const connection_1 = require("../connection");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class DrizzleCompetitionRepository {
    async findById(id) {
        const records = await connection_1.db.select().from(schema_1.competition).where((0, drizzle_orm_1.eq)(schema_1.competition.id, id)).limit(1);
        if (records.length === 0)
            return null;
        const r = records[0];
        return new competition_entity_1.CompetitionEntity(r.id, r.name, r.sportId, r.createdAt);
    }
    async findBySportId(sportId) {
        const records = await connection_1.db.select().from(schema_1.competition).where((0, drizzle_orm_1.eq)(schema_1.competition.sportId, sportId));
        return records.map(r => new competition_entity_1.CompetitionEntity(r.id, r.name, r.sportId, r.createdAt));
    }
    async save(competition) {
        const existing = await this.findById(competition.id);
        if (existing) {
            await connection_1.db
                .update(schema_1.competition)
                .set({ name: competition.name })
                .where((0, drizzle_orm_1.eq)(schema_1.competition.id, competition.id));
        }
        else {
            await connection_1.db.insert(schema_1.competition).values({
                id: competition.id,
                name: competition.name,
                sportId: competition.sportId,
                createdAt: competition.createdAt,
            });
        }
    }
    async delete(id) {
        await connection_1.db.delete(schema_1.competition).where((0, drizzle_orm_1.eq)(schema_1.competition.id, id));
    }
}
exports.DrizzleCompetitionRepository = DrizzleCompetitionRepository;
