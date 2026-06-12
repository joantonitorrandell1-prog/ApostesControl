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

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

export const app = express();

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

app.use('/api/auth', toNodeHandler(auth));

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
