import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { CreateUserUseCase } from '../../../../application/use-cases/create-user.use-case';
import { ChangePasswordUseCase } from '../../../../application/use-cases/change-password.use-case';
import { UserRepositoryPort } from '../../../../domain/ports/user-repository.port';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly userRepository: UserRepositoryPort
  ) {}

  public async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, name, role } = req.body;

      if (!email || !name || !role) {
        return res.status(400).json({ error: 'Email, name, and role are required' });
      }

      if (role !== 'ADMIN' && role !== 'USER') {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const response = await this.createUserUseCase.execute({ email, name, role });
      return res.status(201).json(response);
    } catch (error: any) {
      console.error('Create user controller error:', error);
      return res.status(400).json({ error: error.message || 'Failed to create user' });
    }
  }

  public async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
      }

      await this.changePasswordUseCase.execute(userId, newPassword);
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error: any) {
      console.error('Change password controller error:', error);
      return res.status(400).json({ error: error.message || 'Failed to change password' });
    }
  }

  public async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        requirePasswordChange: user.requirePasswordChange,
        createdAt: user.createdAt.toISOString(),
      });
    } catch (error: any) {
      console.error('Get current user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await this.userRepository.findAll();
      const dtos = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        requirePasswordChange: u.requirePasswordChange,
        createdAt: u.createdAt.toISOString(),
      }));
      return res.status(200).json(dtos);
    } catch (error: any) {
      console.error('Get all users error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'User ID parameter is required' });
      }

      await this.userRepository.delete(id);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
