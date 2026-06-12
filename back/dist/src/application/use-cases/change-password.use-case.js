"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordUseCase = void 0;
const password_hash_1 = require("../utils/password-hash");
class ChangePasswordUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, newPassword) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        // Hash the new password
        const passwordHash = await (0, password_hash_1.hashPassword)(newPassword);
        // Update in repository
        await this.userRepository.updatePassword(userId, passwordHash);
        await this.userRepository.updateRequirePasswordChange(userId, false);
    }
}
exports.ChangePasswordUseCase = ChangePasswordUseCase;
