
import React, { useState } from 'react';
import { User, Notification } from '../../types';
import DailyCheckIn from '../../components/DailyCheckIn';
import { PLANS } from '../../constants';

interface HomeProps {
  user: User;
  updateBalance: (amount: number) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  onOpenWithdraw: () => void;
  onOpenDeposit: () => void;
  onOpenWheel: () => void;
}

const Home: React.FC<HomeProps> = ({ user, updateBalance, addNotification, onOpenWithdraw, onOpenDeposit, onOpenWheel }) => {
  const activePlan = PLANS.find(p => p.id === user.activePlanId);

  const pdfLinks = [
    { 
      title: 'PDF Completo', 
      icon: '📄', 
      url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0' 
    },
    { 
      title: 'Tabela VIP 90 Dias', 
      icon: '📊', 
      url: 'https://www.dropbox.com/scl/fi/sbbbbwno2nois5ssj3m0s/Network_Invest_Tabela_VIP_90_Dias.pdf?rlkey=y9p5fb0hegz2v6kcynodjf2zs&st=875rm74g&dl=0' 
    },
    { 
      title: 'Ganhos com Indicação', 
      icon: '👥', 
      url: 'https://www.dropbox.com/scl/fi/p69zp35yw0rbx53lwikpv/Network_Invest_Ganhos_Com_Indicacao.pdf?rlkey=hjhhcunbkdtkm4fkucje6h1pb&st=99kjaqbu&dl=0' 
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Saldo Total</p>
            <h2 className="text-4xl font-bold mt-1">
              {user.balance.toFixed(2)} <span className="text-xl font-normal opacity-80">USDT</span>
            </h2>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button 
            onClick={onOpenDeposit}
            className="bg-white text-emerald-700 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>DEPÓSITO</span>
          </button>
          <button 
            onClick={onOpenWithdraw}
            className="bg-emerald-500/30 hover:bg-emerald-500/50 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all border border-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>SAQUE</span>
          </button>
        </div>
      </div>

      {/* Roleta Card */}
      <button 
        onClick={onOpenWheel}
        className="w-full bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors">
            <span className="text-2xl">🎰</span>
          </div>
          <div className="text-left">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Bônus Extra</p>
            <p className="font-bold text-gray-800">Roleta da Sorte</p>
          </div>
        </div>
        <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
          Girar
        </div>
      </button>

      {/* Plan Status Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Plano Ativo</p>
            <p className="font-bold text-gray-800">{activePlan ? activePlan.name : 'Nenhum'}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
            Ativo
          </span>
        </div>
      </div>

      {/* Check-in Card */}
      <DailyCheckIn user={user} onCheckIn={(val) => {
        updateBalance(val);
        addNotification('EARNING_CREDITED', `Você ganhou ${val} USDT no check-in diário!`);
      }} />

      {/* PDF Links Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center px-1">
          Materiais Oficiais
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {pdfLinks.map((pdf, idx) => (
            <button 
              key={idx} 
              onClick={() => window.open(pdf.url, '_blank')}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{pdf.icon}</span>
                <span className="font-semibold text-gray-700">{pdf.title}</span>
              </div>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
