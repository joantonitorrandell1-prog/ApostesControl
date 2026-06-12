"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetManagementUseCase = void 0;
const sport_entity_1 = require("../../domain/entities/sport.entity");
const competition_entity_1 = require("../../domain/entities/competition.entity");
const bet_entity_1 = require("../../domain/entities/bet.entity");
class BetManagementUseCase {
    sportRepository;
    competitionRepository;
    betRepository;
    constructor(sportRepository, competitionRepository, betRepository) {
        this.sportRepository = sportRepository;
        this.competitionRepository = competitionRepository;
        this.betRepository = betRepository;
    }
    // --- SPORTS ---
    async createSport(userId, request) {
        const id = 'sport_' + Math.random().toString(36).substring(2, 11);
        const sport = sport_entity_1.SportEntity.create(id, request.name, userId);
        await this.sportRepository.save(sport);
        return this.mapSportToDTO(sport);
    }
    async getSportsByUserId(userId) {
        const sports = await this.sportRepository.findByUserId(userId);
        return sports.map(this.mapSportToDTO);
    }
    async getSportById(sportId) {
        const sport = await this.sportRepository.findById(sportId);
        return sport ? this.mapSportToDTO(sport) : null;
    }
    async deleteSport(sportId) {
        await this.sportRepository.delete(sportId);
    }
    // --- COMPETITIONS ---
    async createCompetition(request) {
        const id = 'comp_' + Math.random().toString(36).substring(2, 11);
        const competition = competition_entity_1.CompetitionEntity.create(id, request.name, request.sportId);
        await this.competitionRepository.save(competition);
        return this.mapCompetitionToDTO(competition);
    }
    async getCompetitionsBySportId(sportId) {
        const competitions = await this.competitionRepository.findBySportId(sportId);
        return competitions.map(this.mapCompetitionToDTO);
    }
    async getCompetitionById(competitionId) {
        const comp = await this.competitionRepository.findById(competitionId);
        return comp ? this.mapCompetitionToDTO(comp) : null;
    }
    async deleteCompetition(competitionId) {
        await this.competitionRepository.delete(competitionId);
    }
    // --- BETS ---
    async createBet(userId, request) {
        const id = 'bet_' + Math.random().toString(36).substring(2, 11);
        const bet = bet_entity_1.BetEntity.create(id, userId, request.competitionId, request.amount, request.odds, request.isBonusCredit, request.status, request.earnings, request.date ? new Date(request.date) : new Date());
        await this.betRepository.save(bet);
        return this.mapBetToDTO(bet);
    }
    async getBetsByUserId(userId) {
        const bets = await this.betRepository.findByUserId(userId);
        return bets.map(this.mapBetToDTO);
    }
    async getBetsByCompetitionId(competitionId) {
        const bets = await this.betRepository.findByCompetitionId(competitionId);
        return bets.map(this.mapBetToDTO);
    }
    async updateBetStatus(betId, status, earnings) {
        const existing = await this.betRepository.findById(betId);
        if (!existing) {
            throw new Error('Bet not found');
        }
        const updated = bet_entity_1.BetEntity.create(existing.id, existing.userId, existing.competitionId, existing.amount, existing.odds, existing.isBonusCredit, status, earnings, existing.date);
        await this.betRepository.save(updated);
        return this.mapBetToDTO(updated);
    }
    async deleteBet(betId) {
        await this.betRepository.delete(betId);
    }
    // --- STATS / DASHBOARD ---
    async getDashboardSummary(userId, filter, sportId) {
        let bets = [];
        if (sportId) {
            bets = await this.betRepository.findBySportId(sportId);
        }
        else {
            bets = await this.betRepository.findByUserId(userId);
        }
        let totalInvested = 0;
        let totalEarnings = 0;
        let wonCount = 0;
        let lostCount = 0;
        let pendingCount = 0;
        bets.forEach(b => {
            totalInvested += b.amount;
            totalEarnings += b.earnings;
            if (b.status === 'WON')
                wonCount++;
            else if (b.status === 'LOST')
                lostCount++;
            else
                pendingCount++;
        });
        const netProfit = totalEarnings - totalInvested;
        const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
        const resolvedBets = wonCount + lostCount;
        const winRate = resolvedBets > 0 ? (wonCount / resolvedBets) * 100 : 0;
        // Build chart data
        const chartGroups = {};
        bets.forEach(b => {
            let label = '';
            const date = b.date;
            if (filter === 'daily') {
                // YYYY-MM-DD
                label = date.toISOString().split('T')[0];
            }
            else if (filter === 'monthly') {
                // YYYY-MM
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                label = `${months[date.getMonth()]} ${date.getFullYear()}`;
            }
            else {
                // YYYY
                label = date.getFullYear().toString();
            }
            if (!chartGroups[label]) {
                chartGroups[label] = { invested: 0, earnings: 0 };
            }
            chartGroups[label].invested += b.amount;
            chartGroups[label].earnings += b.earnings;
        });
        // Sort labels chronologically
        const sortedLabels = Object.keys(chartGroups).sort((a, b) => {
            if (filter === 'daily') {
                return new Date(a).getTime() - new Date(b).getTime();
            }
            else if (filter === 'monthly') {
                const partsA = a.split(' ');
                const partsB = b.split(' ');
                const dateA = new Date(parseInt(partsA[1]), this.getMonthNumber(partsA[0]), 1);
                const dateB = new Date(parseInt(partsB[1]), this.getMonthNumber(partsB[0]), 1);
                return dateA.getTime() - dateB.getTime();
            }
            else {
                return parseInt(a) - parseInt(b);
            }
        });
        const chartData = sortedLabels.map(label => {
            const g = chartGroups[label];
            return {
                label,
                invested: parseFloat(g.invested.toFixed(2)),
                earnings: parseFloat(g.earnings.toFixed(2)),
                netProfit: parseFloat((g.earnings - g.invested).toFixed(2)),
            };
        });
        return {
            totalInvested: parseFloat(totalInvested.toFixed(2)),
            totalEarnings: parseFloat(totalEarnings.toFixed(2)),
            netProfit: parseFloat(netProfit.toFixed(2)),
            roi: parseFloat(roi.toFixed(2)),
            winRate: parseFloat(winRate.toFixed(2)),
            pendingCount,
            wonCount,
            lostCount,
            chartData,
        };
    }
    // --- HELPERS ---
    mapSportToDTO(sport) {
        return {
            id: sport.id,
            name: sport.name,
            userId: sport.userId,
            createdAt: sport.createdAt.toISOString(),
        };
    }
    mapCompetitionToDTO(comp) {
        return {
            id: comp.id,
            name: comp.name,
            sportId: comp.sportId,
            createdAt: comp.createdAt.toISOString(),
        };
    }
    mapBetToDTO(bet) {
        return {
            id: bet.id,
            userId: bet.userId,
            competitionId: bet.competitionId,
            amount: bet.amount,
            odds: bet.odds,
            earnings: bet.earnings,
            isBonusCredit: bet.isBonusCredit,
            status: bet.status,
            date: bet.date.toISOString(),
            createdAt: bet.createdAt.toISOString(),
        };
    }
    getMonthNumber(monthStr) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(monthStr);
    }
}
exports.BetManagementUseCase = BetManagementUseCase;
