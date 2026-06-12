"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportEntity = void 0;
class SportEntity {
    id;
    name;
    userId;
    createdAt;
    constructor(id, name, userId, createdAt) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.createdAt = createdAt;
    }
    static create(id, name, userId) {
        return new SportEntity(id, name, userId, new Date());
    }
}
exports.SportEntity = SportEntity;
