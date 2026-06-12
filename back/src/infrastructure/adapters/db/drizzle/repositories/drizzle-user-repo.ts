import { UserRepositoryPort } from '../../../../../domain/ports/user-repository.port';
import { UserEntity } from '../../../../../domain/entities/user.entity';
import { db } from '../connection';
import { user as userTable, account as accountTable } from '../schema';
import { eq } from 'drizzle-orm';

export class DrizzleUserRepository implements UserRepositoryPort {
  public async findById(id: string): Promise<UserEntity | null> {
    const records = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
    if (records.length === 0) return null;
    const r = records[0];
    return new UserEntity(r.id, r.name, r.email, r.role, r.requirePasswordChange, r.createdAt, r.updatedAt);
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const records = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
    if (records.length === 0) return null;
    const r = records[0];
    return new UserEntity(r.id, r.name, r.email, r.role, r.requirePasswordChange, r.createdAt, r.updatedAt);
  }

  public async findAll(): Promise<UserEntity[]> {
    const records = await db.select().from(userTable);
    return records.map(
      r => new UserEntity(r.id, r.name, r.email, r.role, r.requirePasswordChange, r.createdAt, r.updatedAt)
    );
  }

  public async create(user: UserEntity, passwordHash: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Insert into User Table
      await tx.insert(userTable).values({
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
      await tx.insert(accountTable).values({
        id: accountId,
        userId: user.id,
        accountId: user.email, // BetterAuth uses email as accountId for credential logins
        providerId: 'credential', // BetterAuth default credentials provider ID is 'credential'
        password: passwordHash,
      });
    });
  }

  public async updatePassword(id: string, passwordHash: string): Promise<void> {
    // BetterAuth stores credentials passwords in the account table
    await db
      .update(accountTable)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(accountTable.userId, id));
  }

  public async updateRequirePasswordChange(id: string, requirePasswordChange: boolean): Promise<void> {
    await db
      .update(userTable)
      .set({ requirePasswordChange, updatedAt: new Date() })
      .where(eq(userTable.id, id));
  }

  public async delete(id: string): Promise<void> {
    await db.delete(userTable).where(eq(userTable.id, id));
  }
}
