"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleBetRepository = void 0;
const bet_entity_1 = require("../../../../../domain/entities/bet.entity");
const connection_1 = require("../connection");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class DrizzleBetRepository {
    async findById(id) {
        const records = await connection_1.db.select().from(schema_1.bet).where((0, drizzle_orm_1.eq)(schema_1.bet.id, id)).limit(1);
        if (records.length === 0)
            return null;
        const r = records[0];
        return new bet_entity_1.BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt);
    }
    async findByUserId(userId) {
        const records = await connection_1.db.select().from(schema_1.bet).where((0, drizzle_orm_1.eq)(schema_1.bet.userId, userId));
        return records.map(r => new bet_entity_1.BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt));
    }
    async findByCompetitionId(competitionId) {
        const records = await connection_1.db.select().from(schema_1.bet).where((0, drizzle_orm_1.eq)(schema_1.bet.competitionId, competitionId));
        return records.map(r => new bet_entity_1.BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt));
    }
    async findBySportId(sportId) {
        const records = await connection_1.db
            .select({
            id: schema_1.bet.id,
            userId: schema_1.bet.userId,
            competitionId: schema_1.bet.competitionId,
            amount: schema_1.bet.amount,
            odds: schema_1.bet.odds,
            earnings: schema_1.bet.earnings,
            isBonusCredit: schema_1.bet.isBonusCredit,
            status: schema_1.bet.status,
            date: schema_1.bet.date,
            createdAt: schema_1.bet.createdAt,
        })
            .from(schema_1.bet)
            .innerJoin(schema_1.competition, (0, drizzle_orm_1.eq)(schema_1.bet.competitionId, schema_1.competition.id))
            .innerJoin(schema_1.sport, (0, drizzle_orm_1.eq)(schema_1.competition.sportId, schema_1.sport.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sport.id, sportId));
        return records.map(r => new bet_entity_1.BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt));
    }
    async save(bet) {
        const existing = await this.findById(bet.id);
        if (existing) {
            await connection_1.db
                .update(schema_1.bet)
                .set({
                amount: bet.amount,
                odds: bet.odds,
                earnings: bet.earnings,
                isBonusCredit: bet.isBonusCredit,
                status: bet.status,
                date: bet.date,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.bet.id, bet.id));
        }
        else {
            await connection_1.db.insert(schema_1.bet).values({
                id: bet.id,
                userId: bet.userId,
                competitionId: bet.competitionId,
                amount: bet.amount,
                odds: bet.odds,
                earnings: bet.earnings,
                isBonusCredit: bet.isBonusCredit,
                status: bet.status,
                date: bet.date,
                createdAt: bet.createdAt,
            });
        }
    }
    async delete(id) {
        await connection_1.db.delete(schema_1.bet).where((0, drizzle_orm_1.eq)(schema_1.bet.id, id));
    }
}
exports.DrizzleBetRepository = DrizzleBetRepository;
