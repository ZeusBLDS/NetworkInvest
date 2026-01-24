
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
        <h2 className="text-2xl font-bold text-gray-900">Perfil</h2>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

      {showNotifications && (
        <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-lg space-y-3 max-h-60 overflow-y-auto">
          <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest px-2">Notificações</h3>
          {notifications.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Nenhuma notificação nova</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-medium text-gray-800">{n.message}</p>
                <p className="text-[9px] text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Admin Quick Access */}
      {user.role === 'ADMIN' && (
        <button 
          onClick={() => onViewChange(AppView.ADMIN)}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-700 p-4 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-amber-100 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔐</span>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase opacity-80">Acesso Restrito</p>
              <p className="font-bold">Painel Administrativo</p>
            </div>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      {/* User Info */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-2xl uppercase">
          {user.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
          <p className="text-xs text-gray-400 font-medium">{user.email}</p>
          <p className="text-xs text-gray-400 font-medium">{user.phone}</p>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Carteira de Recebimento</h3>
          <p className="text-xs text-gray-400">Rede: {APP_CONFIG.NETWORK}</p>
        </div>
        <input
          type="text"
          className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-xs font-mono"
          placeholder="0x..."
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
        <button 
          onClick={saveWallet}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all text-sm"
        >
          SALVAR CARTEIRA
        </button>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>SAIR DA CONTA</span>
        </button>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Network Invest v2.5.0</p>
      </div>
    </div>
  );
};

export default Account;
