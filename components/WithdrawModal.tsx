
import React, { useState } from 'react';
import { User } from '../types';
import { APP_CONFIG } from '../constants';

interface WithdrawModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (amount: number, wallet: string, method: 'USDT' | 'PIX') => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ user, onClose, onSubmit }) => {
  const [method, setMethod] = useState<'USDT' | 'PIX'>('USDT');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(method === 'USDT' ? (user.walletAddress || '') : '');

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < APP_CONFIG.MIN_WITHDRAWAL) {
      alert(`O saque mínimo é de ${APP_CONFIG.MIN_WITHDRAWAL} USDT`);
      return;
    }
    if (numAmount > user.balance) {
      alert('Saldo insuficiente');
      return;
    }
    if (!wallet) {
      alert(method === 'PIX' ? 'Informe sua Chave PIX' : 'Informe sua Carteira USDT');
      return;
    }
    onSubmit(numAmount, wallet, method);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/20"></div>
        
        <h2 className="text-xl font-black text-center text-gray-900 mb-6 uppercase tracking-tighter italic">
          SOLICITAR SAQUE
        </h2>

        {/* Seletor de Método */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button 
            onClick={() => setMethod('USDT')}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === 'USDT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            USDT
          </button>
          <button 
            onClick={() => setMethod('PIX')}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === 'PIX' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            PIX
          </button>
        </div>

        <div className="space-y-5">
          <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100">
            <label className="block text-[9px] font-black text-emerald-600 uppercase mb-2 tracking-widest">Saldo Disponível</label>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-900">{user.balance.toFixed(2)}</span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">USDT</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-1 tracking-widest">Valor do Saque (USDT)</label>
            <input 
              type="number"
              placeholder="0.00"
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-sm font-black focus:border-emerald-500 focus:bg-white transition-all outline-none shadow-inner"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="mt-2 text-[9px] font-black text-emerald-600/60 px-1 uppercase tracking-widest">
              * Mínimo de saque: {APP_CONFIG.MIN_WITHDRAWAL} USDT
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-1 tracking-widest">
              {method === 'USDT' ? 'Carteira USDT (BEP20)' : 'Chave PIX (CPF/Email/Cel)'}
            </label>
            <input 
              type="text"
              placeholder={method === 'USDT' ? "0x..." : "Digite sua chave PIX"}
              className={`w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-[11px] ${method === 'USDT' ? 'font-mono' : 'font-black'} focus:border-emerald-500 focus:bg-white transition-all outline-none shadow-inner`}
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={handleWithdraw}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 active:scale-95 transition-all uppercase text-xs tracking-[0.2em]"
            >
              CONFIRMAR SAQUE {method}
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full text-slate-300 font-black text-[9px] uppercase tracking-[0.3em] py-2 hover:text-slate-500 transition-colors"
          >
            VOLTAR AO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
