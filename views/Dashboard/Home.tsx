
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
  // Filtra contratos relevantes: o atual aprovado e qualquer um pendente
  const myContracts = myDeposits.filter(d => d.planId && (d.status === 'PENDING' || d.status === 'APPROVED'));

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-700">
      {/* Saldo Principal */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[35px] p-7 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center opacity-50 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Balanço USDT</span>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold uppercase">Rede Ativa</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mb-8">
            <h2 className="text-4xl font-black tracking-tighter">
              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-emerald-400 font-bold text-xs uppercase">usdt</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onOpenDeposit} className="bg-emerald-500 text-slate-900 font-black py-4 rounded-2xl text-[10px] uppercase active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Depositar</button>
            <button onClick={onOpenWithdraw} className="bg-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase border border-white/10 active:scale-95 transition-all">Sacar Lucro</button>
          </div>
        </div>
      </div>

      {/* Meus Contratos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meus Contratos</h3>
          <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Total: {myContracts.length + (user.activePlanId === 'vip0' ? 1 : 0)}</span>
        </div>
        
        <div className="space-y-3">
          {/* VIP 0 - Cortesia Permanente ou enquanto não tem outro ativo */}
          {user.activePlanId === 'vip0' && (
             <div className="bg-white border border-emerald-50 p-5 rounded-[28px] flex items-center justify-between shadow-sm">
               <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🌱</div>
                 <div>
                   <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Plano VIP 0</p>
                   <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Ativo & Gerando Lucro</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-sm font-black text-slate-800">0.10</p>
                 <p className="text-[8px] text-slate-300 font-bold uppercase">USDT/Dia</p>
               </div>
             </div>
          )}

          {/* Outros contratos comprados */}
          {myContracts.map((contract) => {
            const planInfo = PLANS.find(p => p.id === contract.planId);
            const isApprovedButNotActive = contract.status === 'APPROVED' && user.activePlanId !== contract.planId;
            
            return (
              <div key={contract.id} className="bg-white border border-slate-100 p-5 rounded-[28px] flex items-center justify-between shadow-sm relative overflow-hidden">
                {contract.status === 'PENDING' && <div className="absolute inset-y-0 left-0 w-1 bg-amber-400 animate-pulse"></div>}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${contract.status === 'PENDING' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    {planInfo?.id === 'vip4' ? '👑' : '💎'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{planInfo?.name || 'Contrato'}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${contract.status === 'PENDING' ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                      {contract.status === 'PENDING' ? 'Aguardando Ativação' : 'Contrato Ativo'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{planInfo?.dailyReturn.toFixed(2)}</p>
                  <p className="text-[8px] text-slate-300 font-bold uppercase">USDT/Dia</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ferramentas e Check-in */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onOpenWheel} className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm flex flex-col items-center active:scale-95 transition-all group">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-3 group-hover:rotate-12 transition-transform">🎡</div>
          <p className="text-[9px] text-emerald-600 font-black uppercase mb-1 tracking-widest">Lucky Spin</p>
          <p className="font-black text-slate-800 text-xs">Giro Grátis</p>
        </button>
        <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-3">📈</div>
          <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">Lucro Total</p>
          <p className="font-black text-slate-800 text-xs">{user.totalInvested.toFixed(2)} USDT</p>
        </div>
      </div>

      <DailyCheckIn user={user} onCheckIn={performCheckIn} />
    </div>
  );
};

export default Home;
