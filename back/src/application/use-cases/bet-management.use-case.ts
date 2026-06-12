import { BetRepositoryPort } from '../../domain/ports/bet-repository.port';
import { SportRepositoryPort } from '../../domain/ports/sport-repository.port';
import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { SportEntity } from '../../domain/entities/sport.entity';
import { CompetitionEntity } from '../../domain/entities/competition.entity';
import { BetEntity } from '../../domain/entities/bet.entity';
import {
  CreateSportRequest,
  CreateCompetitionRequest,
  CreateBetRequest,
  SportDTO,
  CompetitionDTO,
  BetDTO,
  DashboardSummary,
  DashboardStatsPeriod,
  BetStatus
} from '../../@types/contract';

export class BetManagementUseCase {
  constructor(
    private readonly sportRepository: SportRepositoryPort,
    private readonly competitionRepository: CompetitionRepositoryPort,
    private readonly betRepository: BetRepositoryPort
  ) {}

  // --- SPORTS ---
  public async createSport(userId: string, request: CreateSportRequest): Promise<SportDTO> {
    const id = 'sport_' + Math.random().toString(36).substring(2, 11);
    const sport = SportEntity.create(id, request.name, userId);
    await this.sportRepository.save(sport);
    return this.mapSportToDTO(sport);
  }

  public async getSportsByUserId(userId: string): Promise<SportDTO[]> {
    const sports = await this.sportRepository.findByUserId(userId);
    return sports.map(this.mapSportToDTO);
  }

  public async getSportById(sportId: string): Promise<SportDTO | null> {
    const sport = await this.sportRepository.findById(sportId);
    return sport ? this.mapSportToDTO(sport) : null;
  }

  public async deleteSport(sportId: string): Promise<void> {
    await this.sportRepository.delete(sportId);
  }

  // --- COMPETITIONS ---
  public async createCompetition(request: CreateCompetitionRequest): Promise<CompetitionDTO> {
    const id = 'comp_' + Math.random().toString(36).substring(2, 11);
    const competition = CompetitionEntity.create(id, request.name, request.sportId);
    await this.competitionRepository.save(competition);
    return this.mapCompetitionToDTO(competition);
  }

  public async getCompetitionsBySportId(sportId: string): Promise<CompetitionDTO[]> {
    const competitions = await this.competitionRepository.findBySportId(sportId);
    return competitions.map(this.mapCompetitionToDTO);
  }

  public async getCompetitionById(competitionId: string): Promise<CompetitionDTO | null> {
    const comp = await this.competitionRepository.findById(competitionId);
    return comp ? this.mapCompetitionToDTO(comp) : null;
  }

  public async deleteCompetition(competitionId: string): Promise<void> {
    await this.competitionRepository.delete(competitionId);
  }

  // --- BETS ---
  public async createBet(userId: string, request: CreateBetRequest): Promise<BetDTO> {
    const id = 'bet_' + Math.random().toString(36).substring(2, 11);
    const bet = BetEntity.create(
      id,
      userId,
      request.competitionId,
      request.amount,
      request.odds,
      request.isBonusCredit,
      request.status,
      request.earnings,
      request.date ? new Date(request.date) : new Date()
    );
    await this.betRepository.save(bet);
    return this.mapBetToDTO(bet);
  }

  public async getBetsByUserId(userId: string): Promise<BetDTO[]> {
    const bets = await this.betRepository.findByUserId(userId);
    return bets.map(this.mapBetToDTO);
  }

  public async getBetsByCompetitionId(competitionId: string): Promise<BetDTO[]> {
    const bets = await this.betRepository.findByCompetitionId(competitionId);
    return bets.map(this.mapBetToDTO);
  }

  public async updateBetStatus(betId: string, status: BetStatus, earnings?: number): Promise<BetDTO> {
    const existing = await this.betRepository.findById(betId);
    if (!existing) {
      throw new Error('Bet not found');
    }

    const updated = BetEntity.create(
      existing.id,
      existing.userId,
      existing.competitionId,
      existing.amount,
      existing.odds,
      existing.isBonusCredit,
      status,
      earnings,
      existing.date
    );

    await this.betRepository.save(updated);
    return this.mapBetToDTO(updated);
  }

  public async deleteBet(betId: string): Promise<void> {
    await this.betRepository.delete(betId);
  }

  // --- STATS / DASHBOARD ---
  public async getDashboardSummary(userId: string, filter: 'daily' | 'monthly' | 'yearly', sportId?: string): Promise<DashboardSummary> {
    let bets: BetEntity[] = [];
    if (sportId) {
      bets = await this.betRepository.findBySportId(sportId);
    } else {
      bets = await this.betRepository.findByUserId(userId);
    }

    let totalInvested = 0;
    let totalEarnings = 0;
    let wonCount = 0;
    let lostCount = 0;
    let pendingCount = 0;

    bets.forEach(b => {
      totalInvested += b.amount;
      totalEarnings += b.earnings;
      if (b.status === 'WON') wonCount++;
      else if (b.status === 'LOST') lostCount++;
      else pendingCount++;
    });

    const netProfit = totalEarnings - totalInvested;
    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
    
    const resolvedBets = wonCount + lostCount;
    const winRate = resolvedBets > 0 ? (wonCount / resolvedBets) * 100 : 0;

    // Build chart data
    const chartGroups: { [key: string]: { invested: number; earnings: number } } = {};

    bets.forEach(b => {
      let label = '';
      const date = b.date;
      if (filter === 'daily') {
        // YYYY-MM-DD
        label = date.toISOString().split('T')[0];
      } else if (filter === 'monthly') {
        // YYYY-MM
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      } else {
        // YYYY
        label = date.getFullYear().toString();
      }

      if (!chartGroups[label]) {
        chartGroups[label] = { invested: 0, earnings: 0 };
      }
      chartGroups[label].invested += b.amount;
      chartGroups[label].earnings += b.earnings;
    });

    // Sort labels chronologically
    const sortedLabels = Object.keys(chartGroups).sort((a, b) => {
      if (filter === 'daily') {
        return new Date(a).getTime() - new Date(b).getTime();
      } else if (filter === 'monthly') {
        const partsA = a.split(' ');
        const partsB = b.split(' ');
        const dateA = new Date(parseInt(partsA[1]), this.getMonthNumber(partsA[0]), 1);
        const dateB = new Date(parseInt(partsB[1]), this.getMonthNumber(partsB[0]), 1);
        return dateA.getTime() - dateB.getTime();
      } else {
        return parseInt(a) - parseInt(b);
      }
    });

    const chartData: DashboardStatsPeriod[] = sortedLabels.map(label => {
      const g = chartGroups[label];
      return {
        label,
        invested: parseFloat(g.invested.toFixed(2)),
        earnings: parseFloat(g.earnings.toFixed(2)),
        netProfit: parseFloat((g.earnings - g.invested).toFixed(2)),
      };
    });

    return {
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      roi: parseFloat(roi.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(2)),
      pendingCount,
      wonCount,
      lostCount,
      chartData,
    };
  }

  // --- HELPERS ---
  private mapSportToDTO(sport: SportEntity): SportDTO {
    return {
      id: sport.id,
      name: sport.name,
      userId: sport.userId,
      createdAt: sport.createdAt.toISOString(),
    };
  }

  private mapCompetitionToDTO(comp: CompetitionEntity): CompetitionDTO {
    return {
      id: comp.id,
      name: comp.name,
      sportId: comp.sportId,
      createdAt: comp.createdAt.toISOString(),
    };
  }

  private mapBetToDTO(bet: BetEntity): BetDTO {
    return {
      id: bet.id,
      userId: bet.userId,
      competitionId: bet.competitionId,
      amount: bet.amount,
      odds: bet.odds,
      earnings: bet.earnings,
      isBonusCredit: bet.isBonusCredit,
      status: bet.status,
      date: bet.date.toISOString(),
      createdAt: bet.createdAt.toISOString(),
    };
  }

  private getMonthNumber(monthStr: string): number {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthStr);
  }
}
