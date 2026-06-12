import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { hashPassword } from '../utils/password-hash';

export class ChangePasswordUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  public async execute(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update in repository
    await this.userRepository.updatePassword(userId, passwordHash);
    await this.userRepository.updateRequirePasswordChange(userId, false);
  }
}
