import { CompetitionEntity } from '../entities/competition.entity.js';

export interface CompetitionRepositoryPort {
  findById(id: string): Promise<CompetitionEntity | null>;
  findBySportId(sportId: string): Promise<CompetitionEntity[]>;
  findByNameAndSportId(name: string, sportId: string): Promise<CompetitionEntity | null>;
  save(competition: CompetitionEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
