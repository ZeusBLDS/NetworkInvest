
import React from 'react';
import { User, Notification, DepositRequest } from '../../types';
import DailyCheckIn from '../../components/DailyCheckIn';
import { PLANS } from '../../constants';

interface HomeProps {
  user: User;
  myDeposits: DepositRequest[];
  updateBalance: (amount: number) => void;
  performCheckIn: () => Promise<number | undefined>;
  addNotification: (type: Notification['type'], message: string) => void;
  onOpenWithdraw: () => void;
  onOpenDeposit: () => void;
  onOpenWheel: () => void;
}

const Home: React.FC<HomeProps> = ({ user, myDeposits, performCheckIn, onOpenWithdraw, onOpenDeposit, onOpenWheel }) => {
  const activePlan = PLANS.find(p => p.id === user.activePlanId);
  
  // Filtra todos os depósitos que são contratos de planos (Ativos ou Pendentes)
  const myContracts = myDeposits.filter(d => d.planId && (d.status === 'PENDING' || d.status === 'APPROVED'));

  return (
    <div className="p-5 space-y-6">
      {/* Saldo Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center opacity-60 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Saldo Disponível</span>
            <span className="text-[9px] font-bold uppercase text-emerald-400">Live USDT</span>
          </div>
          <div className="flex items-baseline space-x-2 mb-8">
            <h2 className="text-4xl font-extrabold tracking-tighter">
              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onOpenDeposit} className="bg-emerald-500 text-slate-900 font-extrabold py-3.5 rounded-2xl text-xs uppercase active:scale-95 transition-all">Depositar</button>
            <button onClick={onOpenWithdraw} className="bg-white/10 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase border border-white/10 active:scale-95 transition-all">Saque</button>
          </div>
        </div>
      </div>

      {/* Meus Contratos (Ativos e Pendentes) */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Meus Contratos</h3>
        
        {/* Sempre mostra o VIP 0 por padrão se for o ativo */}
        {user.activePlanId === 'vip0' && myContracts.every(c => c.planId !== 'vip0') && (
           <div className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center justify-between shadow-sm">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">🌱</div>
               <div>
                 <p className="text-xs font-black text-slate-800">VIP 0 (Cortesia)</p>
                 <p className="text-[9px] text-emerald-500 font-bold uppercase">Ativo & Rendendo</p>
               </div>
             </div>
           </div>
        )}

        {myContracts.map((contract) => {
          const planInfo = PLANS.find(p => p.id === contract.planId);
          return (
            <div key={contract.id} className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">💎</div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase">{planInfo?.name || contract.planId}</p>
                  <p className={`text-[9px] font-bold uppercase ${contract.status === 'PENDING' ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                    {contract.status === 'PENDING' ? 'Aguardando Ativação' : 'Contrato Ativo'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-800">{planInfo?.dailyReturn.toFixed(2)}</p>
                <p className="text-[8px] text-slate-300 font-bold uppercase">USDT/Dia</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ferramentas */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onOpenWheel} className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex flex-col items-center active:scale-95 transition-all">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-2 animate-bounce">🎡</div>
          <p className="text-[9px] text-emerald-600 font-extrabold uppercase mb-0.5">Lucky Spin</p>
          <p className="font-bold text-slate-800 text-xs">Giro Grátis</p>
        </button>
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl mb-2">📊</div>
          <p className="text-[9px] text-slate-400 font-extrabold uppercase mb-0.5">LUCRO TOTAL</p>
          <p className="font-bold text-slate-800 text-xs">{user.totalInvested.toFixed(2)}</p>
        </div>
      </div>

      <DailyCheckIn user={user} onCheckIn={performCheckIn} />
    </div>
  );
};

export default Home;
