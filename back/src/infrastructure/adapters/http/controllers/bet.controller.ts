import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { BetManagementUseCase } from '../../../../application/use-cases/bet-management.use-case';

export class BetController {
  constructor(private readonly betUseCase: BetManagementUseCase) {}

  // --- SPORTS ---
  public createSport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Sport name is required' });

      const sport = await this.betUseCase.createSport(userId, { name });
      return res.status(201).json(sport);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to create sport' });
    }
  };

  public getSports = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const sports = await this.betUseCase.getSportsByUserId(userId);
      return res.status(200).json(sports);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to fetch sports' });
    }
  };

  public getSportDetail = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const sport = await this.betUseCase.getSportById(id);
      if (!sport) return res.status(404).json({ error: 'Sport not found' });
      return res.status(200).json(sport);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to fetch sport' });
    }
  };

  public deleteSport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await this.betUseCase.deleteSport(id);
      return res.status(200).json({ message: 'Sport deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to delete sport' });
    }
  };

  // --- COMPETITIONS ---
  public createCompetition = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, sportId } = req.body;
      if (!name || !sportId) return res.status(400).json({ error: 'Name and sportId are required' });

      const comp = await this.betUseCase.createCompetition({ name, sportId });
      return res.status(201).json(comp);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to create competition' });
    }
  };

  public getCompetitions = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sportId } = req.query;
      if (!sportId || typeof sportId !== 'string') {
        return res.status(400).json({ error: 'sportId query parameter is required' });
      }

      const competitions = await this.betUseCase.getCompetitionsBySportId(sportId);
      return res.status(200).json(competitions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to fetch competitions' });
    }
  };

  public getCompetitionDetail = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const comp = await this.betUseCase.getCompetitionById(id);
      if (!comp) return res.status(404).json({ error: 'Competition not found' });
      return res.status(200).json(comp);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to fetch competition' });
    }
  };

  public deleteCompetition = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await this.betUseCase.deleteCompetition(id);
      return res.status(200).json({ message: 'Competition deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to delete competition' });
    }
  };

  // --- BETS ---
  public createBet = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { competitionId, amount, odds, earnings, isBonusCredit, status, date } = req.body;
      if (!competitionId || amount === undefined || odds === undefined || isBonusCredit === undefined || !status) {
        return res.status(400).json({ error: 'Missing required bet parameters' });
      }

      const bet = await this.betUseCase.createBet(userId, {
        competitionId,
        amount: parseFloat(amount),
        odds: parseFloat(odds),
        earnings: earnings !== undefined ? parseFloat(earnings) : undefined,
        isBonusCredit: !!isBonusCredit,
        status,
        date,
      });

      return res.status(201).json(bet);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to create bet' });
    }
  };

  public getBets = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { competitionId } = req.query;
      if (competitionId && typeof competitionId === 'string') {
        const bets = await this.betUseCase.getBetsByCompetitionId(competitionId);
        return res.status(200).json(bets);
      }

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const bets = await this.betUseCase.getBetsByUserId(userId);
      return res.status(200).json(bets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to fetch bets' });
    }
  };

  public updateBetStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, earnings } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const bet = await this.betUseCase.updateBetStatus(
        id,
        status,
        earnings !== undefined ? parseFloat(earnings) : undefined
      );
      return res.status(200).json(bet);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to update bet' });
    }
  };

  public deleteBet = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await this.betUseCase.deleteBet(id);
      return res.status(200).json({ message: 'Bet deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to delete bet' });
    }
  };

  // --- STATS ---
  public getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const filter = (req.query.filter as 'daily' | 'monthly' | 'yearly') || 'daily';
      const sportId = req.query.sportId as string | undefined;

      if (filter !== 'daily' && filter !== 'monthly' && filter !== 'yearly') {
        return res.status(400).json({ error: 'Invalid filter value. Use daily, monthly or yearly' });
      }

      const stats = await this.betUseCase.getDashboardSummary(userId, filter, sportId);
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error('Stats controller error:', error);
      return res.status(500).json({ error: error.message || 'Failed to load statistics' });
    }
  };
}
