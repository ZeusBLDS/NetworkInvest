
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
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">PLANOS DE RENDA</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ative um contrato para começar a lucrar</p>
      </div>

      <div className="space-y-6">
        {PLANS.map((plan) => {
          if (plan.id === 'vip0') return null; // Não mostra VIP 0 na lista de compra

          const isCurrent = String(user.activePlanId) === String(plan.id);
          const isPending = myDeposits.some(d => d.planId === plan.id && d.status === 'PENDING');

          return (
            <div key={plan.id} className={`relative bg-white rounded-[32px] p-7 border-2 transition-all duration-300 ${isCurrent ? 'border-emerald-500 shadow-xl' : isPending ? 'border-amber-400 animate-pulse' : 'border-gray-50'}`}>
              
              <div className="flex justify-between items-start mb-6 pt-2">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tighter">{plan.name}</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Rendimento de {plan.dailyReturn.toFixed(2)} USDT</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-emerald-600 leading-none">{plan.investment}</p>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Investimento</p>
                </div>
              </div>

              <button
                disabled={isCurrent || isPending}
                onClick={() => onActivate(plan.id)}
                className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] transition-all ${
                  isCurrent ? 'bg-emerald-50 text-emerald-500 cursor-not-allowed border border-emerald-100' :
                  isPending ? 'bg-amber-50 text-amber-600 cursor-not-allowed border border-amber-100' :
                  'bg-gray-900 text-white shadow-lg active:scale-95'
                }`}
              >
                {isCurrent ? 'CONTRATO ATIVO' : isPending ? 'AGUARDANDO APROVAÇÃO' : 'ATIVAR CONTRATO'}
              </button>
              
              {isPending && (
                <p className="text-center text-[9px] text-amber-600 font-bold uppercase mt-3 animate-pulse">
                  Verificando seu comprovante...
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="h-20" />
    </div>
  );
};

export default PlanList;
