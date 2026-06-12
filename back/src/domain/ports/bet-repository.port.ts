import { BetEntity } from '../entities/bet.entity';

export interface BetRepositoryPort {
  findById(id: string): Promise<BetEntity | null>;
  findByUserId(userId: string): Promise<BetEntity[]>;
  findByCompetitionId(competitionId: string): Promise<BetEntity[]>;
  findBySportId(sportId: string): Promise<BetEntity[]>;
  save(bet: BetEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
