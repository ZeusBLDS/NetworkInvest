
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
  const activePlanName = PLANS.find(p => p.id === user.activePlanId)?.name || 'VIP 0';
  
  const docs = [
    { label: 'PDF Completo', url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0', icon: '📄' },
    { label: 'Tabela VIP 90 Dias', url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0', icon: '📊' }
  ];

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-700 bg-slate-50 min-h-screen">
      {/* Saldo Principal */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[35px] p-7 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center opacity-50 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Balanço USDT</span>
          </div>
          <div className="flex items-baseline space-x-2 mb-8">
            <h2 className="text-4xl font-black tracking-tighter">
              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-emerald-400 font-bold text-xs uppercase">usdt</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onOpenDeposit} className="bg-emerald-500 text-slate-900 font-black py-4 rounded-2xl text-[10px] uppercase active:scale-95 transition-all shadow-lg">Depositar</button>
            <button onClick={onOpenWithdraw} className="bg-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase border border-white/10 active:scale-95 transition-all">Sacar</button>
          </div>
        </div>
      </div>

      {/* Plano Ativo - Dinâmico */}
      <div className="space-y-3">
        <div className="bg-white border border-slate-100 p-5 rounded-[28px] flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Plano em Operação</p>
              <p className="text-sm font-black text-slate-800 uppercase">{activePlanName}</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[9px] bg-emerald-500 text-white px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Ativo</span>
          </div>
        </div>
      </div>

      <DailyCheckIn user={user} onCheckIn={performCheckIn} />

      {/* Lucky Spin Button */}
      <button onClick={onOpenWheel} className="w-full bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">🎡</div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Roleta da Sorte</p>
            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Giro Diário Disponível</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* DOCUMENTAÇÃO & GUIAS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Documentação & Guias</h3>
        <div className="bg-white rounded-[32px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
          {docs.map((doc, idx) => (
            <button 
              key={idx}
              onClick={() => window.open(doc.url, '_blank')}
              className="w-full p-5 flex items-center justify-between active:bg-slate-50 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">{doc.icon}</div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{doc.label}</span>
              </div>
              <svg className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
};

export default Home;
