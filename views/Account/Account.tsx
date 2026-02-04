
import React, { useState } from 'react';
import { User, Notification, AppView } from '../../types';
import { APP_CONFIG } from '../../constants';

interface AccountProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (u: User) => void;
  onViewChange: (view: AppView) => void;
  currency: 'BRL' | 'USDT';
  onToggleCurrency: () => void;
  notifications: Notification[];
}

const Account: React.FC<AccountProps> = ({ user, onLogout, notifications, onUpdateUser, onViewChange, currency, onToggleCurrency }) => {
  const [wallet, setWallet] = useState(user.walletAddress || '');
  const [showNotifications, setShowNotifications] = useState(false);
  const whatsappLink = "https://chat.whatsapp.com/DrML9fOcyOQ5IIi2MDnueA?mode=gi_t"; 

  const saveWallet = () => {
    onUpdateUser({ ...user, walletAddress: wallet });
    alert('Carteira salva com sucesso!');
  };

  const copyId = () => {
    navigator.clipboard.writeText(user.referralCode);
    alert('ID de Ativação copiado!');
  };

  const isAdmin = user.role === 'ADMIN' || user.email === 'master@networkinvest.com';

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">MINHA CONTA</h2>
        
        <button 
          onClick={onToggleCurrency}
          className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-2 active:scale-95 transition-all"
        >
          <span className={`text-[10px] font-black ${currency === 'BRL' ? 'text-emerald-600' : 'text-slate-300'}`}>BRL</span>
          <div className="w-8 h-4 bg-slate-100 rounded-full relative p-0.5">
            <div className={`w-3 h-3 bg-emerald-500 rounded-full transition-all duration-300 ${currency === 'USDT' ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
          <span className={`text-[10px] font-black ${currency === 'USDT' ? 'text-emerald-600' : 'text-slate-300'}`}>USDT</span>
        </button>
      </div>

      {isAdmin && (
        <button 
          onClick={() => onViewChange(AppView.ADMIN)}
          className="w-full bg-slate-900 p-6 rounded-[35px] text-white flex items-center justify-between shadow-2xl relative overflow-hidden active:scale-[0.97] transition-all group border border-emerald-500/30"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">🔐</div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Acesso Master</p>
              <p className="font-black italic text-lg tracking-tighter">PAINEL ADMINISTRATIVO</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      )}

      {/* ID DE ATIVAÇÃO */}
      <div className="bg-white rounded-[40px] p-8 border-4 border-emerald-500/10 shadow-sm relative overflow-hidden text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Seu ID Único de Ativação</p>
        <div className="flex flex-col items-center space-y-4">
           <h4 className="text-5xl font-black text-slate-900 tracking-tighter italic select-all">
             {user.referralCode}
           </h4>
           <button 
             onClick={copyId}
             className="bg-emerald-500 text-slate-900 font-black py-2.5 px-8 rounded-xl text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-200"
           >
             Copiar Código
           </button>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-[35px] p-7 border border-slate-100 shadow-sm flex items-center space-x-5">
        <div className="w-16 h-16 bg-slate-900 text-emerald-500 rounded-[24px] flex items-center justify-center font-black text-2xl uppercase shadow-inner border border-emerald-500/20">
          {user.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 italic tracking-tighter uppercase">{user.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onLogout}
          className="w-full bg-white border border-red-100 text-red-500 font-black py-5 rounded-[28px] flex items-center justify-center space-x-3 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>ENCERRAR SESSÃO</span>
        </button>
      </div>

      <div className="text-center pt-8">
        <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">Network Invest v3.3.0</p>
      </div>
    </div>
  );
};

export default Account;
