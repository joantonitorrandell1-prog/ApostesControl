import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { EmailServicePort } from '../../domain/ports/email-service.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserRequest, CreateUserResponse } from '../../@types/contract';
import { hashPassword } from '../utils/password-hash';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly emailService: EmailServicePort
  ) {}

  public async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate random temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!';
    
    // Hash password
    const passwordHash = await hashPassword(temporaryPassword);

    // Generate random ID
    const userId = 'usr_' + Math.random().toString(36).substring(2, 11);

    // Create user entity (requirePasswordChange: true)
    const user = UserEntity.create(
      userId,
      request.name,
      request.email,
      request.role,
      true // requirePasswordChange is true for first login
    );

    // Persist user and account password
    await this.userRepository.create(user, passwordHash);

    // Send invitation email
    await this.emailService.sendUserInvitation(user.email, user.name, temporaryPassword);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        requirePasswordChange: user.requirePasswordChange,
        createdAt: user.createdAt.toISOString(),
      },
      temporaryPassword, // returned to admin so they can display/test if needed
    };
  }
}
