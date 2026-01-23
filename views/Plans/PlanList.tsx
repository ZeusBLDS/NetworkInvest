
import React from 'react';
import { User } from '../../types';
import { PLANS } from '../../constants';

interface PlanListProps {
  user: User;
  onActivate: (planId: string) => void;
}

const PlanList: React.FC<PlanListProps> = ({ user, onActivate }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Planos de 90 Dias</h2>
        <p className="text-gray-500 text-sm">Escolha a melhor opção para seu perfil</p>
      </div>

      <div className="space-y-4">
        {PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative overflow-hidden bg-white rounded-3xl p-6 border-2 transition-all shadow-sm ${
              user.activePlanId === plan.id ? 'border-emerald-500' : 'border-gray-100'
            }`}
          >
            {user.activePlanId === plan.id && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase">
                Atual
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-400">{plan.durationDays} Dias</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-600">{plan.investment} <span className="text-xs">USDT</span></p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Investimento</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ganho Diário</p>
                <p className="text-lg font-bold text-gray-800">{plan.dailyReturn.toFixed(2)} USDT</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rendimento Total</p>
                <p className="text-lg font-bold text-gray-800">{plan.totalReturn.toFixed(2)} USDT</p>
              </div>
            </div>

            {plan.dailyPercent > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-[10px] font-bold text-emerald-600 uppercase mb-1">
                  <span>Lucratividade</span>
                  <span>{plan.dailyPercent}% / Dia</span>
                </div>
                <div className="w-full h-2 bg-emerald-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(plan.dailyPercent * 4, 100)}%` }} />
                </div>
              </div>
            )}

            <button
              disabled={user.activePlanId === plan.id}
              onClick={() => onActivate(plan.id)}
              className={`w-full py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${
                user.activePlanId === plan.id
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700'
              }`}
            >
              {user.activePlanId === plan.id ? 'PLANO ATIVO' : 'ATIVAR PLANO'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
        <div className="flex space-x-3">
          <span className="text-xl">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            O saque mínimo é de <strong>3 USDT</strong>. Todos os rendimentos são creditados diariamente às 00:00 UTC.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanList;
