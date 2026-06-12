import express from 'express';
import dotenv from 'dotenv';

import { db } from './infrastructure/adapters/db/drizzle/connection';
import { user as userTable, account as accountTable } from './infrastructure/adapters/db/drizzle/schema';
import { app } from './app';
import { hashPassword } from './application/utils/password-hash';

dotenv.config();

async function bootstrap() {
  try {
    const users = await db.select().from(userTable).limit(1);
    if (users.length === 0) {
      console.log('Database is empty. Seeding default Admin user...');
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
    }

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Hexagonal Backend Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
