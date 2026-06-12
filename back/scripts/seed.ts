import dotenv from 'dotenv';
import { db } from '../src/infrastructure/adapters/db/drizzle/connection';
import { user as userTable, account as accountTable } from '../src/infrastructure/adapters/db/drizzle/schema';
import { hashPassword } from '../src/application/utils/password-hash';

dotenv.config();

async function seed() {
  console.log('Running seed...');

  const existing = await db.select().from(userTable).limit(1);
  if (existing.length > 0) {
    console.log('Database already has users, skipping seed.');
    process.exit(0);
  }

  const adminId = 'usr_admin';
  const adminEmail = 'admin@bets.com';
  const adminName = 'System Admin';
  const adminPass = 'adminpassword123';

  const passwordHash = await hashPassword(adminPass);

  await db.transaction(async (tx) => {
    await tx.insert(userTable).values({
      id: adminId,
      name: adminName,
      email: adminEmail,
      emailVerified: true,
      role: 'ADMIN',
      requirePasswordChange: false,
    });

    await tx.insert(accountTable).values({
      id: 'acc_admin',
      userId: adminId,
      accountId: adminEmail,
      providerId: 'credential',
      password: passwordHash,
    });
  });

  console.log('==================================================');
  console.log('SEED COMPLETED');
  console.log('Default Admin Account Created:');
  console.log(`- Email: ${adminEmail}`);
  console.log(`- Password: ${adminPass}`);
  console.log('==================================================');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
