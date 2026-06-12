"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetEntity = void 0;
class BetEntity {
    id;
    userId;
    competitionId;
    amount;
    odds;
    earnings;
    isBonusCredit;
    status;
    date;
    createdAt;
    constructor(id, userId, competitionId, amount, odds, earnings, isBonusCredit, status, date, createdAt) {
        this.id = id;
        this.userId = userId;
        this.competitionId = competitionId;
        this.amount = amount;
        this.odds = odds;
        this.earnings = earnings;
        this.isBonusCredit = isBonusCredit;
        this.status = status;
        this.date = date;
        this.createdAt = createdAt;
    }
    static create(id, userId, competitionId, amount, odds, isBonusCredit, status = 'PENDING', earnings = 0, date = new Date()) {
        // If status is WON, earnings = amount * odds. But wait! If it's bonus credit, net earnings = (amount * odds) - amount.
        // If status is LOST, earnings is 0.
        // If status is PENDING, earnings is 0.
        let computedEarnings = earnings;
        if (status === 'WON') {
            const gross = amount * odds;
            computedEarnings = isBonusCredit ? (gross - amount) : gross;
        }
        else if (status === 'LOST' || status === 'PENDING') {
            computedEarnings = 0;
        }
        return new BetEntity(id, userId, competitionId, amount, odds, computedEarnings, isBonusCredit, status, date, new Date());
    }
}
exports.BetEntity = BetEntity;
