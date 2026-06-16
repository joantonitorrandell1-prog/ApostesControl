import express from 'express';
import cors from 'cors';

import { getAuth, getToNodeHandler } from 'better-auth-bridge';
import { DrizzleUserRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-user-repo.js';
import { DrizzleSportRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-sport-repo.js';
import { DrizzleCompetitionRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-competition-repo.js';
import { DrizzleBetRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-bet-repo.js';
import { SmtpEmailAdapter } from './infrastructure/adapters/email/smtp-email.adapter.js';

import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case.js';
import { BetManagementUseCase } from './application/use-cases/bet-management.use-case.js';

import { UserController } from './infrastructure/adapters/http/controllers/user.controller.js';
import { BetController } from './infrastructure/adapters/http/controllers/bet.controller.js';
import { requireAuth, requireAdmin } from './infrastructure/adapters/http/middlewares/auth.middleware.js';

export const app = express();

const allowedOrigins = [
  'https://apostes-control-front.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app') && origin.includes('apostes-control-front')) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Bet Control API', docs: '/api/test' });
});

app.get('/api/test', (req, res) => {
  res.json({ hola: 'el backend funciona' });
});

app.all('/api/auth/*', async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  try {
    const { db } = await import('./infrastructure/adapters/db/drizzle/connection.js');
    const schema = await import('./infrastructure/adapters/db/drizzle/schema.js');
    const auth = await getAuth(db, schema);
    const toNodeHandler = await getToNodeHandler();
    const handler = toNodeHandler(auth);
    await handler(req, res);
    if (!res.headersSent) next();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
});

export const userRepository = new DrizzleUserRepository();
export const sportRepository = new DrizzleSportRepository();
export const competitionRepository = new DrizzleCompetitionRepository();
export const betRepository = new DrizzleBetRepository();
export const emailService = new SmtpEmailAdapter();

export const createUserUseCase = new CreateUserUseCase(userRepository, emailService);
export const changePasswordUseCase = new ChangePasswordUseCase(userRepository);
export const betUseCase = new BetManagementUseCase(sportRepository, competitionRepository, betRepository);

export const userController = new UserController(createUserUseCase, changePasswordUseCase, userRepository);
export const betController = new BetController(betUseCase);

app.get('/api/users/me', requireAuth, (req, res) => userController.getCurrentUser(req, res));
app.post('/api/users/change-password', requireAuth, (req, res) => userController.changePassword(req, res));

app.post('/api/users', requireAuth, requireAdmin, (req, res) => userController.createUser(req, res));
app.get('/api/users', requireAuth, requireAdmin, (req, res) => userController.getAllUsers(req, res));
app.delete('/api/users/:id', requireAuth, requireAdmin, (req, res) => userController.deleteUser(req, res));

app.get('/api/sports', requireAuth, betController.getSports);
app.post('/api/sports', requireAuth, betController.createSport);
app.get('/api/sports/:id', requireAuth, betController.getSportDetail);
app.delete('/api/sports/:id', requireAuth, betController.deleteSport);

app.get('/api/competitions', requireAuth, betController.getCompetitions);
app.post('/api/competitions', requireAuth, betController.createCompetition);
app.get('/api/competitions/:id', requireAuth, betController.getCompetitionDetail);
app.delete('/api/competitions/:id', requireAuth, betController.deleteCompetition);

app.get('/api/bets', requireAuth, betController.getBets);
app.post('/api/bets', requireAuth, betController.createBet);
app.patch('/api/bets/:id', requireAuth, betController.updateBetStatus);
app.delete('/api/bets/:id', requireAuth, betController.deleteBet);

app.get('/api/stats', requireAuth, betController.getDashboardStats);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: err instanceof Error ? err.message : String(err),
    stack: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.stack : undefined) : undefined,
  });
});

export default app;
