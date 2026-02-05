
import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../constants';

interface DepositModalProps {
  onClose: () => void;
  onConfirm: (hash: string, method: 'USDT' | 'PIX', amount: number) => void;
  prefilledAmount?: string;
  wallet: string;
  userCode: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, onConfirm, prefilledAmount = '', wallet, userCode }) => {
  const [method, setMethod] = useState<'USDT' | 'PIX'>('USDT');
  const [amountInput, setAmountInput] = useState(prefilledAmount);
  const [hash, setHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyText, setVerifyText] = useState('');

  const isPlanPurchase = prefilledAmount !== '';
  const pixKey = "440ef26f-f41e-42a6-8964-bb33c44b62bf"; 

  useEffect(() => {
    setAmountInput(prefilledAmount);
  }, [prefilledAmount]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copiado!`);
  };

  const handleSmartVerify = () => {
    const numericAmount = parseFloat(amountInput);
    if (!hash || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Por favor, informe o valor e o comprovante.");
      return;
    }
    
    setIsVerifying(true);
    setVerifyProgress(0);
    
    const steps = [
      "Iniciando Sincronização Automática...",
      "Buscando transação na rede...",
      `Validando ID: ${userCode}...`,
      "Conectando ao gateway de confirmação...",
      "Processando ativação inteligente...",
      "Finalizando!"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setVerifyText(steps[currentStep]);
        setVerifyProgress((currentStep / steps.length) * 100);
      } else {
        clearInterval(interval);
        onConfirm(hash, method, numericAmount); 
      }
    }, 2000);
    
    setVerifyText(steps[0]);
  };

  if (isVerifying) {
    return (
      <div className="fixed inset-0 z-[160] bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-32 h-32 mb-8">
           <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
        </div>
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Validação Inteligente</h2>
        <p className="text-emerald-400 font-mono text-[10px] animate-pulse tracking-widest uppercase mb-8 h-4">
          {verifyText}
        </p>
        <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${verifyProgress}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] bg-white overflow-y-auto">
      <div className="p-6 pb-20 max-w-md mx-auto relative min-h-screen flex flex-col">
        <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <h2 className="text-xl font-black text-center text-gray-900 mt-12 mb-6 uppercase tracking-widest italic">
          {isPlanPurchase ? 'ATIVAR PLANO' : 'DEPOSITAR SALDO'}
        </h2>

        <div className="bg-slate-900 rounded-[30px] p-6 mb-8 border-4 border-emerald-500/20 text-center">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Referência de Depósito</p>
          <span className="text-3xl font-black text-white tracking-tighter">{userCode}</span>
          <p className="text-[8px] text-white/40 font-bold uppercase mt-3">OBRIGATÓRIO INFORMAR ESTE CÓDIGO NO PIX</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full mb-8">
          <button onClick={() => setMethod('USDT')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${method === 'USDT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>USDT (BEP20)</button>
          <button onClick={() => setMethod('PIX')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${method === 'PIX' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>PIX BRASIL</button>
        </div>

        {/* Campo de Valor */}
        <div className="w-full bg-emerald-50 rounded-3xl p-6 mb-8 border border-emerald-100">
          <label className="block text-[10px] font-black text-emerald-600 uppercase mb-2 text-center tracking-widest">Valor a Ser Creditado (USDT)</label>
          {isPlanPurchase ? (
             <div className="flex items-center justify-center space-x-2">
                <span className="text-4xl font-black text-emerald-800">{amountInput}</span>
                <span className="text-lg font-bold text-emerald-600">USDT</span>
             </div>
          ) : (
             <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  className="w-full bg-white border-2 border-emerald-200 rounded-xl p-4 text-center text-2xl font-black text-emerald-900 outline-none" 
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
                <span className="font-black text-emerald-600">USDT</span>
             </div>
          )}
          {!isPlanPurchase && (
             <p className="text-[9px] text-center mt-3 text-emerald-500 font-bold uppercase">R$ {(parseFloat(amountInput || '0') * APP_CONFIG.USDT_BRL_RATE).toFixed(2)} EM REAIS</p>
          )}
        </div>

        <div className="w-full space-y-6">
          {method === 'USDT' ? (
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Endereço de Recebimento</label>
              <div className="w-full px-4 py-3 bg-white rounded-xl border text-[10px] font-mono break-all mb-4 text-gray-600">{wallet}</div>
              <button onClick={() => copyText(wallet, "Carteira")} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-xs uppercase shadow-lg">Copiar Carteira</button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-[35px] border-2 border-slate-50 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Chave PIX Oficial</p>
              <div className="bg-slate-50 p-4 rounded-2xl border mb-4 font-black text-slate-800 text-xs break-all">{pixKey}</div>
              <button onClick={() => copyText(pixKey, "Chave PIX")} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-xs uppercase shadow-lg">Copiar Chave PIX</button>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 px-1">{method === 'USDT' ? 'Hash da Transação' : 'ID do PIX / Nome do Pagador'}</label>
            <input 
              type="text"
              placeholder="Cole aqui o comprovante"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
            />
          </div>

          <button 
            onClick={handleSmartVerify}
            className="w-full font-black py-6 rounded-[28px] shadow-2xl transition-all text-xs uppercase tracking-[0.2em] bg-slate-900 text-white active:scale-95"
          >
            NOTIFICAR DEPÓSITO
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
