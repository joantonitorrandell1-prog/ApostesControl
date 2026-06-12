"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitionEntity = void 0;
class CompetitionEntity {
    id;
    name;
    sportId;
    createdAt;
    constructor(id, name, sportId, createdAt) {
        this.id = id;
        this.name = name;
        this.sportId = sportId;
        this.createdAt = createdAt;
    }
    static create(id, name, sportId) {
        return new CompetitionEntity(id, name, sportId, new Date());
    }
}
exports.CompetitionEntity = CompetitionEntity;
