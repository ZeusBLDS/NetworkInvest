
import React, { useState } from 'react';
import { User } from '../types';
import { APP_CONFIG } from '../constants';

interface WithdrawModalProps {
  user: User;
  onClose: () => void;
  // Fixed: Added wallet parameter to match the function signature expected by handleRequestWithdraw in App.tsx
  onSubmit: (amount: number, wallet: string) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ user, onClose, onSubmit }) => {
  const [source, setSource] = useState('Ganhos Diários');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(user.walletAddress || '');

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
    // Fixed: Now passing both amount and wallet as required by the updated onSubmit signature
    onSubmit(numAmount, wallet);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300">
        <h2 className="text-xl font-black text-center text-gray-900 mb-8 uppercase tracking-tight">
          SOLICITAR SAQUE
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Origem do Saldo</label>
            <select 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
            >
              <option>Ganhos Diários</option>
              <option>Comissões de Rede</option>
            </select>
            <p className="mt-2 text-[10px] font-bold text-gray-400 px-1">
              Disponível: <span className="text-emerald-600">{user.balance.toFixed(2)} USDT</span>
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Valor do Saque</label>
            <input 
              type="number"
              placeholder="0.00"
              className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Sua Carteira BEP20</label>
            <input 
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
          </div>

          <button 
            onClick={handleWithdraw}
            className="w-full bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase text-sm tracking-widest"
          >
            SOLICITAR TRANSFERÊNCIA
          </button>

          <button 
            onClick={onClose}
            className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600"
          >
            CANCELAR SAQUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
