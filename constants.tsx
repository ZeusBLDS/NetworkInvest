
import { Plan } from './types';

export const PLANS: Plan[] = [
  {
    id: 'vip0',
    name: 'VIP 0',
    investment: 0,
    dailyReturn: 0.10,
    dailyPercent: 0, 
    durationDays: 90,
    totalReturn: 9.00
  },
  {
    id: 'vip1',
    name: 'VIP 1',
    investment: 3,
    dailyReturn: 0.30,
    dailyPercent: 10,
    durationDays: 90,
    totalReturn: 30.00
  },
  {
    id: 'vip2',
    name: 'VIP 2',
    investment: 20,
    dailyReturn: 1.60, 
    dailyPercent: 8,
    durationDays: 90,
    totalReturn: 164.00
  },
  {
    id: 'vip3',
    name: 'VIP 3',
    investment: 50,
    dailyReturn: 3.50, 
    dailyPercent: 7,
    durationDays: 90,
    totalReturn: 365.00
  },
  {
    id: 'vip4',
    name: 'VIP 4',
    investment: 80,
    dailyReturn: 16.00, 
    dailyPercent: 20,
    durationDays: 90,
    totalReturn: 1520.00
  }
];

export const REFERRAL_RATES = [0.05, 0.03, 0.01, 0.01, 0.01];

export const APP_CONFIG = {
  MIN_WITHDRAWAL: 3,
  NETWORK: 'USDT (BSC / BEP20)',
  DEFAULT_REFERRER: 'Não informado',
  DEPOSIT_WALLET: '0xc68b8357ca00a27781630d341096bc54e4c4b30f'
};
