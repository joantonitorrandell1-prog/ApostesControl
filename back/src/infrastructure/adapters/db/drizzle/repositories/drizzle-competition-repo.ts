import { CompetitionRepositoryPort } from '../../../../../domain/ports/competition-repository.port';
import { CompetitionEntity } from '../../../../../domain/entities/competition.entity';
import { db } from '../connection';
import { competition as competitionTable } from '../schema';
import { eq } from 'drizzle-orm';

export class DrizzleCompetitionRepository implements CompetitionRepositoryPort {
  public async findById(id: string): Promise<CompetitionEntity | null> {
    const records = await db.select().from(competitionTable).where(eq(competitionTable.id, id)).limit(1);
    if (records.length === 0) return null;
    const r = records[0];
    return new CompetitionEntity(r.id, r.name, r.sportId, r.createdAt);
  }

  public async findBySportId(sportId: string): Promise<CompetitionEntity[]> {
    const records = await db.select().from(competitionTable).where(eq(competitionTable.sportId, sportId));
    return records.map(r => new CompetitionEntity(r.id, r.name, r.sportId, r.createdAt));
  }

  public async save(competition: CompetitionEntity): Promise<void> {
    const existing = await this.findById(competition.id);
    if (existing) {
      await db
        .update(competitionTable)
        .set({ name: competition.name })
        .where(eq(competitionTable.id, competition.id));
    } else {
      await db.insert(competitionTable).values({
        id: competition.id,
        name: competition.name,
        sportId: competition.sportId,
        createdAt: competition.createdAt,
      });
    }
  }

  public async delete(id: string): Promise<void> {
    await db.delete(competitionTable).where(eq(competitionTable.id, id));
  }
}
