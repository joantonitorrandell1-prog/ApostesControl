"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./infrastructure/adapters/db/drizzle/connection");
const schema_1 = require("./infrastructure/adapters/db/drizzle/schema");
const app_1 = require("./app");
const password_hash_1 = require("./application/utils/password-hash");
dotenv_1.default.config();
async function bootstrap() {
    try {
        const users = await connection_1.db.select().from(schema_1.user).limit(1);
        if (users.length === 0) {
            console.log('Database is empty. Seeding default Admin user...');
            const adminId = 'usr_admin';
            const adminEmail = 'admin@bets.com';
            const adminName = 'System Admin';
            const adminPass = 'adminpassword123';
            const passwordHash = await (0, password_hash_1.hashPassword)(adminPass);
            await connection_1.db.transaction(async (tx) => {
                await tx.insert(schema_1.user).values({
                    id: adminId,
                    name: adminName,
                    email: adminEmail,
                    emailVerified: true,
                    role: 'ADMIN',
                    requirePasswordChange: false,
                });
                await tx.insert(schema_1.account).values({
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
        app_1.app.listen(port, () => {
            console.log(`Hexagonal Backend Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
