
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
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Planos de 90 Dias</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Escolha a melhor opção para seu perfil</p>
      </div>

      <div className="space-y-6">
        {PLANS.map((plan) => {
          // Lógica robusta: VIP 0 é o atual se o ID bater OU se o usuário não tiver nenhum ID de plano definido
          const isVip0 = plan.id === 'vip0';
          const isCurrent = user.activePlanId === plan.id || (isVip0 && (!user.activePlanId || user.activePlanId === ''));
          const isPending = myDeposits.some(d => d.planId === plan.id && d.status === 'PENDING');

          return (
            <div key={plan.id} className={`relative bg-white rounded-[32px] p-6 border-2 transition-all duration-300 ${isCurrent ? 'border-emerald-500 shadow-lg shadow-emerald-50' : 'border-slate-100 shadow-sm'}`}>
              
              {isCurrent && (
                <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-200">
                  ATUAL
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{plan.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">90 Dias</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end space-x-1">
                    <span className="text-2xl font-black text-slate-900">{plan.investment}</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">USDT</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Investimento</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Ganho Diário</p>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{plan.dailyReturn.toFixed(2)} USDT</p>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Rendimento Total</p>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{plan.totalReturn.toFixed(2)} USDT</p>
                </div>
              </div>

              {!isVip0 && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-emerald-500">Lucratividade</span>
                    <span className="text-emerald-500">{plan.dailyPercent}% / Dia</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(plan.dailyPercent * 5, 100)}%` }}></div>
                  </div>
                </div>
              )}

              <button
                disabled={isCurrent || isPending}
                onClick={() => onActivate(plan.id)}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
                  isCurrent ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100 shadow-none' :
                  isPending ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                  'bg-emerald-600 text-white shadow-xl shadow-emerald-100 active:scale-95 hover:bg-emerald-700'
                }`}
              >
                {isCurrent ? 'PLANO ATIVO' : isPending ? 'AGUARDANDO APROVAÇÃO' : 'ATIVAR PLANO'}
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
