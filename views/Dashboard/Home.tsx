
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
  const pendingDeposit = myDeposits.find(d => d.status === 'PENDING' && d.planId);

  return (
    <div className="p-5 space-y-6">
      {/* Saldo Header - Novo Design Estilo Neo-Bank */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center opacity-60 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Patrimônio Total</span>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase">Live</span>
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2 mb-8">
            <h2 className="text-4xl font-extrabold tracking-tighter">
              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className="text-emerald-400 font-bold text-sm">USDT</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onOpenDeposit}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold py-3.5 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all text-xs uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              <span>Depositar</span>
            </button>
            <button 
              onClick={onOpenWithdraw}
              className="bg-white/10 hover:bg-white/20 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all border border-white/10 text-xs uppercase tracking-wider backdrop-blur-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Saque</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Pendência */}
      {pendingDeposit && (
        <div className="glass border-amber-200/50 rounded-3xl p-4 flex items-center space-x-4">
           <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">⏳</div>
           <div className="flex-1">
             <p className="text-[9px] font-extrabold text-amber-800 uppercase tracking-widest">Ativação em análise</p>
             <p className="text-[11px] font-semibold text-amber-700 leading-tight">Seu plano {pendingDeposit.planId?.toUpperCase()} será ativado em instantes.</p>
           </div>
        </div>
      )}

      {/* Grid de Ferramentas Diárias */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onOpenWheel} className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex flex-col items-center group active:scale-95 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[7px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Novo</div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-3 animate-bounce">🎡</div>
          <p className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-widest mb-0.5">Lucky Spin</p>
          <p className="font-bold text-slate-800 text-xs">Giro Grátis</p>
        </button>
        
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl mb-3">💎</div>
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Nível Atual</p>
          <p className="font-bold text-slate-800 text-xs">{activePlan?.name || 'Iniciante'}</p>
        </div>
      </div>

      {/* Check-in Diário */}
      <DailyCheckIn user={user} onCheckIn={performCheckIn} />

      {/* Seção de Documentação e Treinamento */}
      <div className="space-y-3">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hub de Conhecimento</h3>
          <span className="text-[8px] font-bold text-emerald-500 uppercase">Ver tudo</span>
        </div>
        
        <div className="grid gap-3">
          <button 
            onClick={() => window.open('https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&dl=0', '_blank')} 
            className="w-full bg-white border border-slate-100 rounded-[24px] p-4 flex items-center justify-between shadow-sm active:bg-slate-50 transition-all border-l-4 border-l-emerald-500"
          >
             <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
               </div>
               <div className="text-left">
                 <p className="font-extrabold text-slate-800 text-xs uppercase">Apresentação</p>
                 <p className="text-[9px] text-slate-400 font-bold uppercase">Business Plan v2.5</p>
               </div>
             </div>
             <div className="bg-slate-50 p-2 rounded-lg text-slate-300">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
             </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
