import { BetRepositoryPort } from '../../../../../domain/ports/bet-repository.port';
import { BetEntity } from '../../../../../domain/entities/bet.entity';
import { db } from '../connection';
import { bet as betTable, competition as competitionTable, sport as sportTable } from '../schema';
import { eq } from 'drizzle-orm';

export class DrizzleBetRepository implements BetRepositoryPort {
  public async findById(id: string): Promise<BetEntity | null> {
    const records = await db.select().from(betTable).where(eq(betTable.id, id)).limit(1);
    if (records.length === 0) return null;
    const r = records[0];
    return new BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt);
  }

  public async findByUserId(userId: string): Promise<BetEntity[]> {
    const records = await db.select().from(betTable).where(eq(betTable.userId, userId));
    return records.map(r => new BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt));
  }

  public async findByCompetitionId(competitionId: string): Promise<BetEntity[]> {
    const records = await db.select().from(betTable).where(eq(betTable.competitionId, competitionId));
    return records.map(r => new BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt));
  }

  public async findBySportId(sportId: string): Promise<BetEntity[]> {
    const records = await db
      .select({
        id: betTable.id,
        userId: betTable.userId,
        competitionId: betTable.competitionId,
        amount: betTable.amount,
        odds: betTable.odds,
        earnings: betTable.earnings,
        isBonusCredit: betTable.isBonusCredit,
        status: betTable.status,
        date: betTable.date,
        createdAt: betTable.createdAt,
      })
      .from(betTable)
      .innerJoin(competitionTable, eq(betTable.competitionId, competitionTable.id))
      .innerJoin(sportTable, eq(competitionTable.sportId, sportTable.id))
      .where(eq(sportTable.id, sportId));

    return records.map(r => new BetEntity(r.id, r.userId, r.competitionId, r.amount, r.odds, r.earnings, r.isBonusCredit, r.status, r.date, r.createdAt));
  }

  public async save(bet: BetEntity): Promise<void> {
    const existing = await this.findById(bet.id);
    if (existing) {
      await db
        .update(betTable)
        .set({
          amount: bet.amount,
          odds: bet.odds,
          earnings: bet.earnings,
          isBonusCredit: bet.isBonusCredit,
          status: bet.status,
          date: bet.date,
        })
        .where(eq(betTable.id, bet.id));
    } else {
      await db.insert(betTable).values({
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

  public async delete(id: string): Promise<void> {
    await db.delete(betTable).where(eq(betTable.id, id));
  }
}
