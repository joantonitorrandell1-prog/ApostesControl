import { UserEntity } from '../entities/user.entity';

export interface UserRepositoryPort {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  create(user: UserEntity, passwordHash: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateRequirePasswordChange(id: string, requirePasswordChange: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}
