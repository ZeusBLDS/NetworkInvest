
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

const Home: React.FC<HomeProps> = ({ user, myDeposits, performCheckIn, addNotification, onOpenWithdraw, onOpenDeposit, onOpenWheel }) => {
  const activePlan = PLANS.find(p => p.id === user.activePlanId);
  const pendingDeposit = myDeposits.find(d => d.status === 'PENDING' && d.planId);

  return (
    <div className="p-6 space-y-6">
      {/* Header com Saldo */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[32px] p-7 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest opacity-70">Saldo Disponível</p>
            <h2 className="text-4xl font-black mt-1">{user.balance.toFixed(2)} <span className="text-xl font-medium opacity-40">USDT</span></h2>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onOpenDeposit} className="bg-white text-emerald-800 font-black py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all text-[11px] uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Depositar</span>
          </button>
          <button onClick={onOpenWithdraw} className="bg-emerald-500/30 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all border border-white/10 text-[11px] uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Saque</span>
          </button>
        </div>
      </div>

      {/* Alerta de Plano Pendente */}
      {pendingDeposit && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center space-x-4 animate-pulse">
           <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">⏳</div>
           <div>
             <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Ativação Pendente</p>
             <p className="text-xs font-bold text-amber-700 leading-tight">Aguardando confirmação do Admin para o plano {pendingDeposit.planId}.</p>
           </div>
        </div>
      )}

      {/* Cards de Atalho */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onOpenWheel} className="bg-white rounded-[28px] p-5 border border-emerald-50 shadow-sm flex flex-col items-center group active:scale-95 transition-all">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-3">🎰</div>
          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-1">Giro Grátis</p>
          <p className="font-black text-gray-800 text-xs tracking-tight">Roleta Diária</p>
        </button>
        
        <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl mb-3">🛡️</div>
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Status Atual</p>
          <p className="font-black text-gray-800 text-xs tracking-tight">{activePlan?.name || 'Iniciante'}</p>
        </div>
      </div>

      {/* Check-in Diário */}
      <DailyCheckIn user={user} onCheckIn={performCheckIn} />

      {/* Seção de Materiais Restituidos */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Materiais de Apoio</h3>
        <div className="grid gap-3">
          <button 
            onClick={() => window.open('https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0', '_blank')} 
            className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm active:bg-gray-50 transition-colors"
          >
             <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xl font-bold">PDF</div>
               <div className="text-left">
                 <p className="font-bold text-gray-800 text-xs uppercase tracking-tight">Apresentação Oficial</p>
                 <p className="text-[9px] text-gray-400 font-bold uppercase">Plano de Negócios</p>
               </div>
             </div>
             <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>

          <button 
            onClick={() => window.open('https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0', '_blank')} 
            className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm active:bg-gray-50 transition-colors"
          >
             <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl font-bold">📖</div>
               <div className="text-left">
                 <p className="font-bold text-gray-800 text-xs uppercase tracking-tight">Tutorial de Uso</p>
                 <p className="text-[9px] text-gray-400 font-bold uppercase">Passo a Passo App</p>
               </div>
             </div>
             <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
