import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';

import { auth } from './infrastructure/config/better-auth.config';
import { DrizzleUserRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-user-repo';
import { DrizzleSportRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-sport-repo';
import { DrizzleCompetitionRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-competition-repo';
import { DrizzleBetRepository } from './infrastructure/adapters/db/drizzle/repositories/drizzle-bet-repo';
import { SmtpEmailAdapter } from './infrastructure/adapters/email/smtp-email.adapter';

import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { BetManagementUseCase } from './application/use-cases/bet-management.use-case';

import { UserController } from './infrastructure/adapters/http/controllers/user.controller';
import { BetController } from './infrastructure/adapters/http/controllers/bet.controller';
import { requireAuth, requireAdmin } from './infrastructure/adapters/http/middlewares/auth.middleware';

export const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get('/api/test', (req, res) => {
  res.json({ hola: 'el backend funciona' });
});

let authHandler: ReturnType<typeof toNodeHandler> | null = null;
try {
  authHandler = toNodeHandler(auth);
} catch (error) {
  console.error('❌ Failed to initialize auth handler:', error);
}

app.use('/api/auth', async (req, res, next) => {
  if (!authHandler) {
    return res.status(500).json({ error: 'Auth handler not initialized' });
  }
  try {
    await authHandler(req, res);
  } catch (error) {
    console.error('❌ ERROR CRÍTIC A BETTER AUTH:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.use(express.json());

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
