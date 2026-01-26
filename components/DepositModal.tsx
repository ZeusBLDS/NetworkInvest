
import React, { useState, useEffect } from 'react';

interface DepositModalProps {
  onClose: () => void;
  onConfirm: (hash: string, method: 'USDT' | 'PIX') => void;
  prefilledAmount?: string;
  wallet: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, onConfirm, prefilledAmount = '', wallet }) => {
  const [method, setMethod] = useState<'USDT' | 'PIX'>('USDT');
  const [amount, setAmount] = useState(prefilledAmount);
  const [hash, setHash] = useState('');
  const isPlanPurchase = prefilledAmount !== '';

  const pixKey = "financeiro@networkinvest.com"; // Exemplo de chave PIX

  useEffect(() => {
    setAmount(prefilledAmount);
  }, [prefilledAmount]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado com sucesso!');
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white overflow-y-auto">
      <div className="p-6 pb-20 max-w-md mx-auto relative min-h-screen flex flex-col items-center">
        <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <h2 className="text-xl font-black text-center text-gray-900 mt-12 mb-6 uppercase tracking-widest italic">
          DEPOSITAR
        </h2>

        {/* Seletor de Método */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full mb-8">
          <button 
            onClick={() => setMethod('USDT')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'USDT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            USDT (BEP20)
          </button>
          <button 
            onClick={() => setMethod('PIX')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'PIX' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            PIX (BRASIL)
          </button>
        </div>

        {isPlanPurchase && (
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-8 text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Valor do Plano</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-4xl font-black text-emerald-800">{amount}</span>
              <span className="text-lg font-bold text-emerald-600">USDT</span>
            </div>
            {method === 'PIX' && (
              <p className="text-[9px] text-emerald-600 font-bold mt-2 opacity-70 italic">
                Câmbio: 1 USDT = R$ 5,50 (Aprox. R$ {(parseFloat(amount) * 5.5).toFixed(2)})
              </p>
            )}
          </div>
        )}

        {method === 'USDT' ? (
          <div className="w-full flex flex-col items-center">
            <div className="bg-white p-4 rounded-[40px] shadow-2xl shadow-gray-200 border border-gray-100 mb-8">
              <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-3xl overflow-hidden">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet}`} 
                  alt="QR Code Depósito" 
                  className="w-40 h-40"
                />
              </div>
            </div>
            <div className="w-full bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-6">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Endereço USDT (BEP20)</label>
              <div className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 text-[10px] font-mono break-all mb-4 text-gray-600">
                {wallet}
              </div>
              <button 
                onClick={() => copyText(wallet)}
                className="w-full bg-[#111827] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-gray-200"
              >
                COPIAR CARTEIRA
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="bg-white p-6 rounded-[40px] shadow-2xl shadow-gray-200 border border-gray-100 mb-8 text-center">
              <span className="text-4xl mb-4 block">📱</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pagamento via PIX</p>
              <div className="bg-slate-50 p-4 rounded-2xl border mb-4">
                <p className="text-xs font-black text-slate-800 select-all">{pixKey}</p>
              </div>
              <button 
                onClick={() => copyText(pixKey)}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                COPIAR CHAVE PIX
              </button>
            </div>
            <div className="w-full bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-6 text-center">
              <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                Após realizar o PIX, anexe o código da transação ou seu nome completo abaixo para identificação.
              </p>
            </div>
          </div>
        )}

        <div className="w-full space-y-6">
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
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 px-1">
                {method === 'USDT' ? 'ID da Transação (Hash)' : 'Comprovante / Nome Pagador'}
              </label>
              <input 
                type="text"
                placeholder={method === 'USDT' ? "Cole aqui o Hash da transação" : "ID do PIX ou seu Nome"}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => hash && onConfirm(hash, method)}
              disabled={!hash || (amount === '' && !isPlanPurchase)}
              className={`w-full font-bold py-5 rounded-2xl shadow-xl transition-all text-sm uppercase tracking-widest ${
                hash && (amount !== '' || isPlanPurchase)
                ? 'bg-emerald-700 text-white shadow-emerald-100 active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ENVIAR SOLICITAÇÃO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
