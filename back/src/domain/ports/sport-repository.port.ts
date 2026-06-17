import { SportEntity } from '../entities/sport.entity.js';

export interface SportRepositoryPort {
  findById(id: string): Promise<SportEntity | null>;
  findByUserId(userId: string): Promise<SportEntity[]>;
  findByNameAndUserId(name: string, userId: string): Promise<SportEntity | null>;
  save(sport: SportEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
