
import { Plan } from './types';

export const PLANS: Plan[] = [
  {
    id: 'vip_trial',
    name: 'VIP EXPERIÊNCIA',
    investment: 2.666667, // R$ 16.00 / 6
    dailyReturn: 0.30,    // R$ 1.80 / 6
    dailyPercent: 11.25,
    durationDays: 3,
    totalReturn: 0.90,
    tasksPerDay: 1
  },
  {
    id: 'vip1',
    name: 'VIP 1',
    investment: 20.00,    // R$ 120.00 / 6
    dailyReturn: 1.25,    // R$ 7.50 / 6
    dailyPercent: 6.25,
    durationDays: 90,
    totalReturn: 112.50,
    tasksPerDay: 1
  },
  {
    id: 'vip2',
    name: 'VIP 2',
    investment: 50.00,    // R$ 300.00 / 6
    dailyReturn: 2.00,    // R$ 12.00 / 6
    dailyPercent: 4.00,
    durationDays: 90,
    totalReturn: 180.00,
    tasksPerDay: 1
  },
  {
    id: 'vip3',
    name: 'VIP 3',
    investment: 100.00,   // R$ 600.00 / 6
    dailyReturn: 2.50,    // R$ 15.00 / 6
    dailyPercent: 2.50,
    durationDays: 90,
    totalReturn: 225.00,
    tasksPerDay: 1
  },
  {
    id: 'vip4',
    name: 'VIP 4',
    investment: 150.00,   // R$ 900.00 / 6
    dailyReturn: 5.00,    // R$ 30.00 / 6
    dailyPercent: 3.33,
    durationDays: 90,
    totalReturn: 450.00,
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
