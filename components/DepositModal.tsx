
import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../constants';

interface DepositModalProps {
  onClose: () => void;
  onConfirm: (hash: string) => void;
  prefilledAmount?: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, onConfirm, prefilledAmount = '' }) => {
  const [amount, setAmount] = useState(prefilledAmount);
  const [hash, setHash] = useState('');
  const isPlanPurchase = prefilledAmount !== '';

  useEffect(() => {
    setAmount(prefilledAmount);
  }, [prefilledAmount]);

  const copyWallet = () => {
    navigator.clipboard.writeText(APP_CONFIG.DEPOSIT_WALLET);
    alert('Endereço copiado!');
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white overflow-y-auto">
      <div className="p-6 pb-20 max-w-md mx-auto relative min-h-screen flex flex-col items-center">
        <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <h2 className="text-xl font-black text-center text-gray-900 mt-12 mb-8 uppercase tracking-widest italic">
          DEPOSITAR USDT
        </h2>

        {isPlanPurchase && (
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-8 text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Valor do Plano</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-4xl font-black text-emerald-800">{amount}</span>
              <span className="text-lg font-bold text-emerald-600">USDT</span>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-[40px] shadow-2xl shadow-gray-200 border border-gray-100 mb-8">
          <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-3xl overflow-hidden">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${APP_CONFIG.DEPOSIT_WALLET}`} 
              alt="QR Code Depósito" 
              className="w-40 h-40"
            />
          </div>
        </div>

        <div className="w-full space-y-6">
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Endereço USDT (BEP20)</label>
            <div className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 text-[10px] font-mono break-all mb-4 text-gray-600">
              {APP_CONFIG.DEPOSIT_WALLET}
            </div>
            <button 
              onClick={copyWallet}
              className="w-full bg-[#111827] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-gray-200"
            >
              COPIAR CARTEIRA
            </button>
          </div>

          <div className="space-y-3 px-1">
            {!isPlanPurchase && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 px-1">Quantia USDT</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 px-1">ID da Transação (Hash)</label>
              <input 
                type="text"
                placeholder="Cole aqui o Hash da transação"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => hash && onConfirm(hash)}
              disabled={!hash || (amount === '' && !isPlanPurchase)}
              className={`w-full font-bold py-5 rounded-2xl shadow-xl transition-all text-sm uppercase tracking-widest ${
                hash && (amount !== '' || isPlanPurchase)
                ? 'bg-emerald-700 text-white shadow-emerald-100 active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              CONFIRMAR PAGAMENTO
            </button>
            <p className="text-[9px] text-gray-400 text-center mt-4 uppercase font-bold tracking-tighter">
              A ativação será processada após a verificação do administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
