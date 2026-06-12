"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
class UserEntity {
    id;
    name;
    email;
    role;
    requirePasswordChange;
    createdAt;
    updatedAt;
    constructor(id, name, email, role, requirePasswordChange, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.requirePasswordChange = requirePasswordChange;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(id, name, email, role = 'USER', requirePasswordChange = false) {
        const now = new Date();
        return new UserEntity(id, name, email, role, requirePasswordChange, now, now);
    }
}
exports.UserEntity = UserEntity;
