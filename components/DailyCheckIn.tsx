
import React, { useState } from 'react';
import { User } from '../types';

interface DailyCheckInProps {
  user: User;
  onCheckIn: () => Promise<number | undefined>;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ user, onCheckIn }) => {
  const [loading, setLoading] = useState(false);
  
  // Comparação de data local robusta
  const today = new Date().toLocaleDateString('pt-BR');
  const lastCheckInDate = user.lastCheckIn ? new Date(user.lastCheckIn).toLocaleDateString('pt-BR') : '';
  const alreadyCheckedIn = lastCheckInDate === today;

  const displayStreak = user.checkInStreak || 0;
  const currentDayInCycle = ((displayStreak - (alreadyCheckedIn ? 1 : 0)) % 30) + 1;
  const earningToday = 0.01;

  const totalProfit = (user.balance || 0) + (user.totalWithdrawn || 0);

  const handleCheckIn = async () => {
    if (alreadyCheckedIn || loading) return;
    setLoading(true);
    try {
      await onCheckIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Check-in Diário</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Dia {currentDayInCycle} de 30</p>
        </div>
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
          <span className="text-2xl">🎁</span>
        </div>
      </div>

      <div className="bg-emerald-50/50 rounded-2xl p-5 mb-6 border border-emerald-50 grid grid-cols-2 gap-4">
        <div className="border-r border-emerald-100/50">
          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-70">
            {alreadyCheckedIn ? 'GANHOU HOJE' : 'GANHO DE HOJE'}
          </p>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black text-emerald-800">{earningToday.toFixed(2)}</span>
            <span className="text-[8px] font-black text-emerald-600 uppercase">usdt</span>
          </div>
        </div>
        <div className="pl-2">
          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-70">LUCRO TOTAL</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black text-emerald-800">{totalProfit.toFixed(2)}</span>
            <span className="text-[8px] font-black text-emerald-600 uppercase">usdt</span>
          </div>
        </div>
      </div>

      <button
        disabled={alreadyCheckedIn || loading}
        onClick={handleCheckIn}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-xl uppercase tracking-widest ${
          alreadyCheckedIn || loading
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-100'
        }`}
      >
        {loading ? 'PROCESSANDO...' : alreadyCheckedIn ? 'CHECK-IN REALIZADO' : 'REALIZAR CHECK-IN'}
      </button>

      <div className="mt-6 flex gap-1 justify-between">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full flex-1 transition-all ${
              i < (displayStreak % 30) ? 'bg-emerald-500' : 'bg-slate-100'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default DailyCheckIn;
