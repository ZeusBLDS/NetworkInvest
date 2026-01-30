
import { Plan } from './types';

export const PLANS: Plan[] = [
  {
    id: 'vip_trial',
    name: 'VIP EXPERIÊNCIA',
    investment: 0.00,
    dailyReturn: 0.30,
    dailyPercent: 0,
    durationDays: 3,
    totalReturn: 0.90,
    tasksPerDay: 1
  },
  {
    id: 'vip0',
    name: 'VIP 0',
    investment: 0.00,
    dailyReturn: 0.05,
    dailyPercent: 0,
    durationDays: 365,
    totalReturn: 18.25,
    tasksPerDay: 1
  },
  {
    id: 'vip1',
    name: 'VIP 1',
    investment: 20,
    dailyReturn: 1.25,
    dailyPercent: 6.25,
    durationDays: 90,
    totalReturn: 112.50,
    tasksPerDay: 1
  },
  {
    id: 'vip2',
    name: 'VIP 2',
    investment: 50,
    dailyReturn: 2.00, 
    dailyPercent: 4,
    durationDays: 90,
    totalReturn: 180.00,
    tasksPerDay: 1
  },
  {
    id: 'vip3',
    name: 'VIP 3',
    investment: 100,
    dailyReturn: 2.50, 
    dailyPercent: 2.5,
    durationDays: 90,
    totalReturn: 225.00,
    tasksPerDay: 1
  },
  {
    id: 'vip4',
    name: 'VIP 4',
    investment: 150,
    dailyReturn: 5.00, 
    dailyPercent: 3.33,
    durationDays: 90,
    totalReturn: 450.00,
    tasksPerDay: 1
  }
];

export const REFERRAL_RATES = [0.05, 0.03, 0.01, 0.01, 0.01];

export const APP_CONFIG = {
  MIN_WITHDRAWAL: 9, 
  NETWORK: 'USDT (BSC / BEP20)',
  DEFAULT_REFERRER: 'Não informado',
  DEPOSIT_WALLET: '0xc68b8357ca00a27781630d341096bc54e4c4b30f',
  WITHDRAW_HOURS: {
    START: 17,
    END: 22,
    DAYS: [1, 2, 3, 4, 5]
  },
  TASK_DAYS: [1, 2, 3, 4, 5]
};
