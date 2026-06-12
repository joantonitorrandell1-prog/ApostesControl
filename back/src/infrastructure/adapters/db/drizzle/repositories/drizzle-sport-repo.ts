import { SportRepositoryPort } from '../../../../../domain/ports/sport-repository.port';
import { SportEntity } from '../../../../../domain/entities/sport.entity';
import { db } from '../connection';
import { sport as sportTable } from '../schema';
import { eq } from 'drizzle-orm';

export class DrizzleSportRepository implements SportRepositoryPort {
  public async findById(id: string): Promise<SportEntity | null> {
    const records = await db.select().from(sportTable).where(eq(sportTable.id, id)).limit(1);
    if (records.length === 0) return null;
    const r = records[0];
    return new SportEntity(r.id, r.name, r.userId, r.createdAt);
  }

  public async findByUserId(userId: string): Promise<SportEntity[]> {
    const records = await db.select().from(sportTable).where(eq(sportTable.userId, userId));
    return records.map(r => new SportEntity(r.id, r.name, r.userId, r.createdAt));
  }

  public async save(sport: SportEntity): Promise<void> {
    const existing = await this.findById(sport.id);
    if (existing) {
      await db
        .update(sportTable)
        .set({ name: sport.name })
        .where(eq(sportTable.id, sport.id));
    } else {
      await db.insert(sportTable).values({
        id: sport.id,
        name: sport.name,
        userId: sport.userId,
        createdAt: sport.createdAt,
      });
    }
  }

  public async delete(id: string): Promise<void> {
    await db.delete(sportTable).where(eq(sportTable.id, id));
  }
}
