import { SportEntity } from '../entities/sport.entity.js';

export interface SportRepositoryPort {
  findById(id: string): Promise<SportEntity | null>;
  findByUserId(userId: string): Promise<SportEntity[]>;
  save(sport: SportEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
