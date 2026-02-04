
import React from 'react';
import { User, DepositRequest } from '../../types';
import { PLANS, APP_CONFIG } from '../../constants';

interface PlanListProps {
  user: User;
  myDeposits: DepositRequest[];
  currency: 'BRL' | 'USDT';
  onActivate: (planId: string) => void;
}

const PlanList: React.FC<PlanListProps> = ({ user, myDeposits, onActivate, currency }) => {
  const availablePlans = PLANS.filter(plan => {
    if (plan.id === 'vip_trial') {
      return !user.trialUsed && !user.activePlanId;
    }
    return true;
  });

  const formatValue = (val: number) => {
    if (currency === 'BRL') {
      const brlValue = val * APP_CONFIG.USDT_BRL_RATE;
      return brlValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return `${val.toFixed(2)} USDT`;
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight uppercase italic">Nossos Planos</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Oportunidades de Mercado Global</p>
      </div>

      <div className="space-y-6">
        {availablePlans.map((plan) => {
          const isCurrent = user.activePlanId === plan.id;
          const isPending = myDeposits.some(d => d.planId === plan.id && d.status === 'PENDING');
          const isFree = plan.id === 'vip0' || plan.id === 'vip_trial';

          return (
            <div key={plan.id} className={`relative bg-white rounded-[40px] p-7 border-2 transition-all duration-500 overflow-hidden ${isCurrent ? 'border-emerald-500 shadow-2xl shadow-emerald-100' : 'border-white shadow-xl shadow-slate-200/50'}`}>
              
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 ${isFree ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

              {isCurrent && (
                <div className="absolute top-4 right-6 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200 z-10">
                  ATUAL
                </div>
              )}

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className={`text-2xl font-black tracking-tighter uppercase italic ${isFree ? 'text-amber-600' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase">{plan.durationDays} Dias</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end space-x-1">
                    <span className="text-2xl font-black text-slate-900">
                      {currency === 'BRL' ? (plan.investment * APP_CONFIG.USDT_BRL_RATE).toFixed(2) : plan.investment.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-black uppercase ${isFree ? 'text-amber-500' : 'text-emerald-500'}`}>{currency}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Adesão</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Ganho Diário</p>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{formatValue(plan.dailyReturn)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50 text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Retorno Final</p>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{formatValue(plan.totalReturn)}</p>
                </div>
              </div>

              <button
                disabled={isCurrent || isPending}
                onClick={() => onActivate(plan.id)}
                className={`w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isCurrent ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-200' :
                  isPending ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse' :
                  isFree 
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-100 active:scale-95' 
                    : 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 active:scale-95 hover:bg-emerald-700'
                }`}
              >
                {isCurrent ? 'PLANO ATUAL' : isPending ? 'VALIDANDO...' : isFree ? 'RESGATAR TESTE' : 'ADQUIRIR AGORA'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="h-24" />
    </div>
  );
};

export default PlanList;
