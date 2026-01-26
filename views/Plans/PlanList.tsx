
import React from 'react';
import { User, DepositRequest } from '../../types';
import { PLANS } from '../../constants';

interface PlanListProps {
  user: User;
  myDeposits: DepositRequest[];
  onActivate: (planId: string) => void;
}

const PlanList: React.FC<PlanListProps> = ({ user, myDeposits, onActivate }) => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight uppercase italic">Nossos Planos</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Oportunidades de Mercado Global</p>
      </div>

      <div className="space-y-6">
        {PLANS.map((plan) => {
          const isCurrent = user.activePlanId === plan.id;
          const isPending = myDeposits.some(d => d.planId === plan.id && d.status === 'PENDING');
          const isVipZero = plan.id === 'vip0';

          return (
            <div key={plan.id} className={`relative bg-white rounded-[40px] p-7 border-2 transition-all duration-500 overflow-hidden ${isCurrent ? 'border-emerald-500 shadow-2xl shadow-emerald-100' : 'border-white shadow-xl shadow-slate-200/50'}`}>
              
              {/* Decorative elements */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 ${isVipZero ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

              {isCurrent && (
                <div className="absolute top-4 right-6 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200 z-10">
                  ATUAL
                </div>
              )}

              {isVipZero && !isCurrent && (
                <div className="absolute top-4 right-6 bg-amber-100 text-amber-700 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-10">
                  INICIANTE
                </div>
              )}

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className={`text-2xl font-black tracking-tighter uppercase italic ${isVipZero ? 'text-amber-600' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase">{plan.durationDays} Dias</span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Contrato</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end space-x-1">
                    <span className="text-3xl font-black text-slate-900">{plan.investment}</span>
                    <span className={`text-xs font-black uppercase ${isVipZero ? 'text-amber-500' : 'text-emerald-500'}`}>USDT</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Adesão</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Ganho Diário</p>
                  <p className="text-base font-black text-slate-800 tracking-tight">{plan.dailyReturn.toFixed(2)} USDT</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50 text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Retorno Final</p>
                  <p className="text-base font-black text-slate-800 tracking-tight">{plan.totalReturn.toFixed(2)} USDT</p>
                </div>
              </div>

              <div className="mb-8 space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className={isVipZero ? 'text-amber-600' : 'text-emerald-600'}>Rentabilidade</span>
                  <span className={isVipZero ? 'text-amber-600' : 'text-emerald-600'}>{plan.dailyPercent}% / Dia</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ${isVipZero ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} style={{ width: `${Math.min(plan.dailyPercent * 5, 100)}%` }}></div>
                </div>
              </div>

              <button
                disabled={isCurrent || isPending}
                onClick={() => onActivate(plan.id)}
                className={`w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isCurrent ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-200' :
                  isPending ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse' :
                  isVipZero 
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-100 active:scale-95' 
                    : 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 active:scale-95 hover:bg-emerald-700'
                }`}
              >
                {isCurrent ? 'PLANO ATUAL' : isPending ? 'VALIDANDO HASH...' : 'ADQUIRIR AGORA'}
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
