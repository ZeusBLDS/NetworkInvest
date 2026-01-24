
import React, { useState } from 'react';
import { User, Notification, AppView } from '../../types';
import { APP_CONFIG } from '../../constants';

interface AccountProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (u: User) => void;
  onViewChange: (view: AppView) => void;
  notifications: Notification[];
}

const Account: React.FC<AccountProps> = ({ user, onLogout, notifications, onUpdateUser, onViewChange }) => {
  const [wallet, setWallet] = useState(user.walletAddress || '');
  const [showNotifications, setShowNotifications] = useState(false);

  const saveWallet = () => {
    onUpdateUser({ ...user, walletAddress: wallet });
    alert('Carteira salva com sucesso!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">CONTA</h2>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shadow-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-black">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

      {showNotifications && (
        <div className="bg-white rounded-[32px] p-5 border border-emerald-100 shadow-xl space-y-3 max-h-64 overflow-y-auto animate-in fade-in zoom-in duration-300">
          <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">Notificações Recentes</h3>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-300 text-center py-6 font-bold uppercase">Sem novidades por aqui</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-800 leading-tight">{n.message}</p>
                <p className="text-[9px] text-slate-400 mt-2 font-black">{new Date(n.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Admin Quick Access - Destaque Visual */}
      {user.role === 'ADMIN' && (
        <button 
          onClick={() => onViewChange(AppView.ADMIN)}
          className="w-full bg-slate-900 p-6 rounded-[35px] text-white flex items-center justify-between shadow-2xl relative overflow-hidden active:scale-[0.97] transition-all group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🔐</div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-1">Painel Master</p>
              <p className="font-black italic text-lg tracking-tighter">ADMINISTRATIVO</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      )}

      {/* User Card */}
      <div className="bg-white rounded-[35px] p-7 border border-slate-100 shadow-sm flex items-center space-x-5">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center font-black text-2xl uppercase shadow-inner">
          {user.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 italic tracking-tighter uppercase">{user.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</p>
          <div className="flex items-center space-x-2 mt-1">
             <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
             <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{user.role} ATIVO</span>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="bg-white rounded-[35px] p-7 border border-slate-100 shadow-sm space-y-5">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Sua Carteira USDT</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase">REDE: {APP_CONFIG.NETWORK}</p>
        </div>
        <input
          type="text"
          className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none text-[11px] font-mono text-slate-600 focus:ring-2 focus:ring-emerald-500 transition-all"
          placeholder="0x..."
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
        <button 
          onClick={saveWallet}
          className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-50"
        >
          ATUALIZAR CARTEIRA
        </button>
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
        <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">Network Invest v3.1.0-Gold</p>
      </div>
    </div>
  );
};

export default Account;
