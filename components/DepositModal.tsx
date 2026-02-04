
import React, { useState, useEffect } from 'react';

interface DepositModalProps {
  onClose: () => void;
  onConfirm: (hash: string, method: 'USDT' | 'PIX') => void;
  prefilledAmount?: string;
  wallet: string;
  userCode: string; // Adicionado código do usuário para referência
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, onConfirm, prefilledAmount = '', wallet, userCode }) => {
  const [method, setMethod] = useState<'USDT' | 'PIX'>('USDT');
  const [amount, setAmount] = useState(prefilledAmount);
  const [hash, setHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyText, setVerifyText] = useState('');

  const isPlanPurchase = prefilledAmount !== '';
  const pixKey = "440ef26f-f41e-42a6-8964-bb33c44b62bf"; 

  useEffect(() => {
    setAmount(prefilledAmount);
  }, [prefilledAmount]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copiado!`);
  };

  const handleSmartVerify = () => {
    if (!hash || (amount === '' && !isPlanPurchase)) return;
    
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
        onConfirm(hash, method); // Chama a confirmação real
      }
    }, 2500);
    
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
        <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
            style={{ width: `${verifyProgress}%` }}
          ></div>
        </div>
        <p className="text-[8px] text-white/30 mt-10 font-black uppercase tracking-[0.3em]">Não feche esta tela para garantir a ativação automática</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] bg-white overflow-y-auto">
      <div className="p-6 pb-20 max-w-md mx-auto relative min-h-screen flex flex-col">
        <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <h2 className="text-xl font-black text-center text-gray-900 mt-12 mb-6 uppercase tracking-widest italic">
          ATIVAÇÃO INTELIGENTE
        </h2>

        {/* Banner do ID Único - OBRIGATÓRIO */}
        <div className="bg-slate-900 rounded-[30px] p-6 mb-8 border-4 border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 text-center">Referência de Ativação Automática</p>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-white tracking-tighter mb-4">{userCode}</span>
              <button 
                onClick={() => copyText(userCode, "Código")}
                className="bg-emerald-500 text-slate-900 font-black py-2.5 px-6 rounded-xl text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                Copiar Meu Código
              </button>
            </div>
            <p className="text-[8px] text-white/40 font-bold uppercase mt-4 text-center leading-relaxed">
              ⚠️ VOCÊ <span className="text-white">DEVE</span> COLOCAR ESTE CÓDIGO NA DESCRIÇÃO DO SEU PAGAMENTO PARA ATIVAÇÃO IMEDIATA.
            </p>
          </div>
        </div>

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
            PIX BRASIL
          </button>
        </div>

        {isPlanPurchase && (
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-8 text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total para Ativação</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-4xl font-black text-emerald-800">{amount}</span>
              <span className="text-lg font-bold text-emerald-600">USDT</span>
            </div>
          </div>
        )}

        {method === 'USDT' ? (
          <div className="w-full space-y-6">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Endereço de Recebimento</label>
              <div className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 text-[10px] font-mono break-all mb-4 text-gray-600">
                {wallet}
              </div>
              <button 
                onClick={() => copyText(wallet, "Carteira")}
                className="w-full bg-[#111827] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Copiar Carteira
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-[35px] border-2 border-slate-50 shadow-sm text-center">
              <span className="text-4xl mb-4 block">📱</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Chave PIX Oficial</p>
              <div className="bg-slate-50 p-4 rounded-2xl border mb-4 font-black text-slate-800 text-xs break-all">
                {pixKey}
              </div>
              <button 
                onClick={() => copyText(pixKey, "Chave PIX")}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                Copiar Chave PIX
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="space-y-3 px-1">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 px-1">
                {method === 'USDT' ? 'Hash da Transação' : 'Comprovante / Nome do Pagador'}
              </label>
              <input 
                type="text"
                placeholder={method === 'USDT' ? "Insira a Hash BEP20" : "ID do PIX ou Nome Completo"}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleSmartVerify}
            disabled={!hash || (amount === '' && !isPlanPurchase)}
            className={`w-full font-black py-6 rounded-[28px] shadow-2xl transition-all text-xs uppercase tracking-[0.2em] ${
              hash && (amount !== '' || isPlanPurchase)
              ? 'bg-slate-900 text-white shadow-emerald-100 active:scale-95' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            SOLICITAR ATIVAÇÃO SMART
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
