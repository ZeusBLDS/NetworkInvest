
export enum AppView {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  PLANS = 'PLANS',
  NETWORK = 'NETWORK',
  ACCOUNT = 'ACCOUNT',
  ADMIN = 'ADMIN'
}

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  referralCode: string;
  referredBy: string;
  balance: number;
  walletAddress?: string;
  activePlanId?: string;
  joinDate: number;
  lastCheckIn?: number;
  checkInStreak: number;
  isFirstLogin: boolean;
  role: 'USER' | 'ADMIN';
  lastWheelSpin?: number;
  status: UserStatus;
  totalInvested: number;
  totalWithdrawn: number;
}

export interface Plan {
  id: string;
  name: string;
  investment: number;
  dailyReturn: number;
  dailyPercent: number;
  durationDays: number;
  totalReturn: number;
  withdrawalLimit?: number;
}

export interface Notification {
  id: string;
  type: 'PLAN_ACTIVATED' | 'EARNING_CREDITED' | 'WITHDRAWAL_REQUEST' | 'WITHDRAWAL_PAID' | 'NEW_REFERRAL';
  message: string;
  timestamp: number;
  read: boolean;
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  hash: string;
  planId?: string; // If this deposit was for a specific plan
  timestamp: number;
  status: RequestStatus;
  method: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  wallet: string;
  fee: number;
  timestamp: number;
  status: RequestStatus;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  platformBalance: number;
  totalInvested: number;
  totalPaid: number;
  dailyProfit: number;
}
