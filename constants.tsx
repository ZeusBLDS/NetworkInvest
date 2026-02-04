
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
    id: 'vip1',
    name: 'VIP 1',
    investment: 3.00,
    dailyReturn: 0.30,
    dailyPercent: 10,
    durationDays: 90,
    totalReturn: 27.00,
    tasksPerDay: 1
  },
  {
    id: 'vip2',
    name: 'VIP 2',
    investment: 20.00,
    dailyReturn: 1.60,
    dailyPercent: 8,
    durationDays: 90,
    totalReturn: 144.00,
    tasksPerDay: 1
  },
  {
    id: 'vip3',
    name: 'VIP 3',
    investment: 50.00,
    dailyReturn: 3.50,
    dailyPercent: 7,
    durationDays: 90,
    totalReturn: 315.00,
    tasksPerDay: 1
  },
  {
    id: 'vip4',
    name: 'VIP 4',
    investment: 80.00,
    dailyReturn: 16.00,
    dailyPercent: 20,
    durationDays: 90,
    totalReturn: 1440.00,
    tasksPerDay: 1
  }
];

export const REFERRAL_RATES = [0.05, 0.03, 0.01, 0.01, 0.01];

export const APP_CONFIG = {
  MIN_WITHDRAWAL: 9, 
  USDT_BRL_RATE: 6.00, // Taxa de conversão USDT para BRL
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
