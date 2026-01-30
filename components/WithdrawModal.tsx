
import React, { useState, useEffect } from 'react';
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

  // Verificação de Horário e Dia de Saque
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [timeMessage, setTimeMessage] = useState('');

  // O limite é lido diretamente do APP_CONFIG que agora é dinâmico
  const minLimit = APP_CONFIG.MIN_WITHDRAWAL;
  const isPromo = minLimit === 6;

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();
      
      const isCorrectDay = APP_CONFIG.WITHDRAW_HOURS.DAYS.includes(day);
      const isCorrectTime = hours >= APP_CONFIG.WITHDRAW_HOURS.START && hours < APP_CONFIG.WITHDRAW_HOURS.END;

      if (isCorrectDay && isCorrectTime) {
        setCanWithdraw(true);
      } else {
        setCanWithdraw(false);
        if (!isCorrectDay) {
          setTimeMessage('SAQUES APENAS DE SEGUNDA A SEXTA');
        } else {
          setTimeMessage(`HORÁRIO DE SAQUE: ${APP_CONFIG.WITHDRAW_HOURS.START}H ÀS ${APP_CONFIG.WITHDRAW_HOURS.END}H`);
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 30000); // Checa a cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleWithdraw = () => {
    if (!canWithdraw && user.role !== 'ADMIN') {
      alert(`⚠️ ATENÇÃO:\n\n${timeMessage}\n\nSolicitações fora do horário não serão processadas.`);
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minLimit) {
      alert(`O saque mínimo atual é de ${minLimit} USDT`);
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

  const currentFee = method === 'PIX' ? 0.10 : 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${canWithdraw ? (isPromo ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-amber-500'}`}></div>
        
        <h2 className="text-xl font-black text-center text-gray-900 mb-6 uppercase tracking-tighter italic">
          SOLICITAR SAQUE
        </h2>

        {/* Promo Badge */}
        {isPromo && (
          <div className="mb-4 bg-blue-50 border border-blue-100 py-2 px-4 rounded-xl flex items-center justify-center space-x-2 animate-pulse">
            <span className="text-sm">🔥</span>
            <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest">
              Promoção: Saque mínimo reduzido para 6.00 USDT hoje!
            </p>
          </div>
        )}

        {/* Banner de Status de Horário */}
        {!canWithdraw && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 text-center animate-pulse">
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-tight">
              {timeMessage}<br/>
              <span className="opacity-60">Solicitações fora do horário não serão processadas</span>
            </p>
          </div>
        )}

        {/* Seletor de Método */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button 
            onClick={() => { setMethod('USDT'); setWallet(user.walletAddress || ''); }}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === 'USDT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            USDT (FREE)
          </button>
          <button 
            onClick={() => { setMethod('PIX'); setWallet(''); }}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === 'PIX' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            PIX (10%)
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
            <div className="flex justify-between items-center mt-2 px-1">
              <p className={`text-[9px] font-black uppercase tracking-widest ${isPromo ? 'text-blue-600' : 'text-emerald-600/60'}`}>
                * Mínimo: {minLimit} USDT
              </p>
              {parseFloat(amount) > 0 && (
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                  Taxa: {(parseFloat(amount) * currentFee).toFixed(2)} USDT
                </p>
              )}
            </div>
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
              disabled={!canWithdraw && user.role !== 'ADMIN'}
              className={`w-full font-black py-5 rounded-2xl shadow-xl transition-all uppercase text-xs tracking-[0.2em] ${
                canWithdraw || user.role === 'ADMIN'
                ? 'bg-emerald-600 text-white shadow-emerald-100 active:scale-95'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {canWithdraw || user.role === 'ADMIN' ? `CONFIRMAR SAQUE ${method}` : 'SAQUE INDISPONÍVEL'}
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
