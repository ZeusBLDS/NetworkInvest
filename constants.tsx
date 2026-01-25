
import { Plan } from './types';

export const PLANS: Plan[] = [
  {
    id: 'vip0',
    name: 'VIP 0',
    investment: 3,
    dailyReturn: 0.30,
    dailyPercent: 10, 
    durationDays: 30,
    totalReturn: 9.00,
    tasksPerDay: 1
  },
  {
    id: 'vip1',
    name: 'VIP 1',
    investment: 20,
    dailyReturn: 1.60,
    dailyPercent: 8,
    durationDays: 90,
    totalReturn: 144.00,
    tasksPerDay: 1
  },
  {
    id: 'vip2',
    name: 'VIP 2',
    investment: 50,
    dailyReturn: 3.00, 
    dailyPercent: 6,
    durationDays: 90,
    totalReturn: 270.00,
    tasksPerDay: 1
  },
  {
    id: 'vip3',
    name: 'VIP 3',
    investment: 100,
    dailyReturn: 5.50, // Ajustado para ser progressivo (conforme sua lista enviada)
    dailyPercent: 5.5,
    durationDays: 90,
    totalReturn: 495.00,
    tasksPerDay: 1
  },
  {
    id: 'vip4',
    name: 'VIP 4',
    investment: 150,
    dailyReturn: 8.00, 
    dailyPercent: 5.3,
    durationDays: 90,
    totalReturn: 720.00,
    tasksPerDay: 1
  }
];

export const REFERRAL_RATES = [0.05, 0.03, 0.01, 0.01, 0.01];

export const APP_CONFIG = {
  MIN_WITHDRAWAL: 3,
  NETWORK: 'USDT (BSC / BEP20)',
  DEFAULT_REFERRER: 'Não informado',
  DEPOSIT_WALLET: '0xc68b8357ca00a27781630d341096bc54e4c4b30f'
};
