
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
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contratos de 90 dias com lucro diário</p>
      </div>

      <div className="space-y-6">
        {PLANS.map((plan) => {
          // Lógica robusta: Verifica se o ID do plano guardado no perfil do usuário é o mesmo deste card
          const isCurrent = String(user.activePlanId) === String(plan.id);
          
          // Verifica se há um pedido de ativação pendente para este plano
          const isPending = myDeposits.some(d => d.planId === plan.id && d.status === 'PENDING');

          return (
            <div key={plan.id} className={`relative bg-white rounded-[32px] p-7 border-2 transition-all duration-300 ${isCurrent ? 'border-emerald-500 shadow-2xl shadow-emerald-50' : isPending ? 'border-amber-400 shadow-xl shadow-amber-50' : 'border-gray-50'}`}>
              
              {/* Badges de Status */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-6 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg z-10">CONTRATO ATIVO</div>
              )}
              {isPending && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[9px] font-black px-6 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg z-10">AGUARDANDO ADMIN</div>
              )}

              <div className="flex justify-between items-start mb-6 pt-2">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none mb-1 tracking-tighter">{plan.name}</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Validade: {plan.durationDays} Dias Úteis</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-emerald-600 leading-none mb-1">{plan.investment} <span className="text-[10px] opacity-40 font-medium">USDT</span></p>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Preço de Ativação</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-gray-50/70 p-4 rounded-3xl border border-gray-100 shadow-inner">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lucro Diário</p>
                  <p className="text-lg font-black text-gray-800">{plan.dailyReturn.toFixed(2)} USDT</p>
                </div>
                <div className="bg-gray-50/70 p-4 rounded-3xl border border-gray-100 shadow-inner">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Retorno Total</p>
                  <p className="text-lg font-black text-gray-800">{plan.totalReturn.toFixed(2)} USDT</p>
                </div>
              </div>

              <button
                disabled={isCurrent || isPending}
                onClick={() => onActivate(plan.id)}
                className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] transition-all ${
                  isCurrent ? 'bg-emerald-50 text-emerald-500 cursor-not-allowed border border-emerald-100' :
                  isPending ? 'bg-amber-50 text-amber-600 cursor-not-allowed border border-amber-100' :
                  'bg-gray-900 text-white shadow-2xl shadow-gray-200 active:scale-95 active:shadow-none'
                }`}
              >
                {isCurrent ? 'PLANO ATIVO' : isPending ? 'VALIDANDO PAGAMENTO' : 'ATIVAR CONTRATO AGORA'}
              </button>
              
              <div className="mt-4 text-center">
                 {isCurrent ? (
                    <p className="text-[9px] text-emerald-600 font-bold uppercase animate-pulse">O rendimento diário já está sendo gerado</p>
                 ) : (
                    <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">O ciclo de 24h inicia após a confirmação do Admin</p>
                 )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="h-10" />
    </div>
  );
};

export default PlanList;
