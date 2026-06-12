// Shared Enums
export type UserRole = 'ADMIN' | 'USER';
export type BetStatus = 'WON' | 'LOST' | 'PENDING';

// User DTOs
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  requirePasswordChange: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
}

export interface CreateUserResponse {
  user: UserDTO;
  temporaryPassword?: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

// Sport DTOs
export interface SportDTO {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface CreateSportRequest {
  name: string;
}

// Competition DTOs
export interface CompetitionDTO {
  id: string;
  name: string;
  sportId: string;
  createdAt: string;
}

export interface CreateCompetitionRequest {
  name: string;
  sportId: string;
}

// Bet DTOs
export interface BetDTO {
  id: string;
  userId: string;
  competitionId: string;
  amount: number;
  odds: number;
  earnings: number;
  isBonusCredit: boolean;
  status: BetStatus;
  date: string;
  createdAt: string;
}

export interface CreateBetRequest {
  competitionId: string;
  amount: number;
  odds: number;
  earnings?: number;
  isBonusCredit: boolean;
  status: BetStatus;
  date?: string;
}

export interface UpdateBetRequest {
  amount?: number;
  odds?: number;
  earnings?: number;
  isBonusCredit?: boolean;
  status?: BetStatus;
}

// Dashboard DTOs
export interface DashboardStatsPeriod {
  label: string; // e.g. "2026-06-12" or "June" or "2026"
  invested: number;
  earnings: number;
  netProfit: number;
}

export interface DashboardSummary {
  totalInvested: number;
  totalEarnings: number;
  netProfit: number;
  roi: number; // Return on Investment percentage
  winRate: number; // percentage of won bets
  pendingCount: number;
  wonCount: number;
  lostCount: number;
  chartData: DashboardStatsPeriod[];
}
