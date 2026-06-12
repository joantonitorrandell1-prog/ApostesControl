"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
class UserController {
    createUserUseCase;
    changePasswordUseCase;
    userRepository;
    constructor(createUserUseCase, changePasswordUseCase, userRepository) {
        this.createUserUseCase = createUserUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.userRepository = userRepository;
    }
    async createUser(req, res) {
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
        }
        catch (error) {
            console.error('Create user controller error:', error);
            return res.status(400).json({ error: error.message || 'Failed to create user' });
        }
    }
    async changePassword(req, res) {
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
        }
        catch (error) {
            console.error('Change password controller error:', error);
            return res.status(400).json({ error: error.message || 'Failed to change password' });
        }
    }
    async getCurrentUser(req, res) {
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
        }
        catch (error) {
            console.error('Get current user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getAllUsers(req, res) {
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
        }
        catch (error) {
            console.error('Get all users error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'User ID parameter is required' });
            }
            await this.userRepository.delete(id);
            return res.status(200).json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.UserController = UserController;
