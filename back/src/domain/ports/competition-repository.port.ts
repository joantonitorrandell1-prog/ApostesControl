import { CompetitionEntity } from '../entities/competition.entity';

export interface CompetitionRepositoryPort {
  findById(id: string): Promise<CompetitionEntity | null>;
  findBySportId(sportId: string): Promise<CompetitionEntity[]>;
  save(competition: CompetitionEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
