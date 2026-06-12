"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
const password_hash_1 = require("../utils/password-hash");
class CreateUserUseCase {
    userRepository;
    emailService;
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    async execute(request) {
        const existingUser = await this.userRepository.findByEmail(request.email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Generate random temporary password
        const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!';
        // Hash password
        const passwordHash = await (0, password_hash_1.hashPassword)(temporaryPassword);
        // Generate random ID
        const userId = 'usr_' + Math.random().toString(36).substring(2, 11);
        // Create user entity (requirePasswordChange: true)
        const user = user_entity_1.UserEntity.create(userId, request.name, request.email, request.role, true // requirePasswordChange is true for first login
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
exports.CreateUserUseCase = CreateUserUseCase;
