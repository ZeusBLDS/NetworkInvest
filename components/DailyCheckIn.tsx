
import React, { useState } from 'react';
import { User } from '../types';

interface DailyCheckInProps {
  user: User;
  onCheckIn: () => Promise<void>;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ user, onCheckIn }) => {
  const [loading, setLoading] = useState(false);
  
  const today = new Date().toDateString();
  const lastCheckInDate = user.lastCheckIn ? new Date(user.lastCheckIn).toDateString() : '';
  const alreadyCheckedIn = lastCheckInDate === today;

  // Lógica de Streak para exibição visual
  let displayStreak = user.checkInStreak;
  let isStreakBroken = false;
  
  if (user.lastCheckIn) {
    const lastCheckInDateObj = new Date(user.lastCheckIn);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Se não for hoje nem ontem, a sequência quebrou visualmente
    if (lastCheckInDateObj.toDateString() !== today && lastCheckInDateObj.toDateString() !== yesterday.toDateString()) {
      displayStreak = 0;
      isStreakBroken = true;
    }
  }

  const currentDayInCycle = (displayStreak % 30) + 1;
  const earningToday = currentDayInCycle * 0.01;

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
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
      {alreadyCheckedIn && (
        <div className="absolute top-0 right-0 p-3">
          <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Concluído</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Check-in Diário</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Dia {currentDayInCycle} de 30</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <span className="text-emerald-600 text-xl font-bold">🎁</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 mb-4">
        <div>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-60">Hoje você ganha</p>
          <p className="text-2xl font-black text-emerald-800">{earningToday.toFixed(2)} <span className="text-xs font-bold">USDT</span></p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-60">Sua Sequência</p>
          <p className="text-2xl font-black text-emerald-800">{displayStreak} <span className="text-xs font-bold">dias</span></p>
        </div>
      </div>

      {isStreakBroken && !alreadyCheckedIn && (
        <div className="mb-4 bg-amber-50 border border-amber-100 p-2 rounded-xl text-center">
          <p className="text-[9px] text-amber-700 font-bold uppercase">Sua sequência foi reiniciada por falta de atividade</p>
        </div>
      )}

      <button
        disabled={alreadyCheckedIn || loading}
        onClick={handleCheckIn}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-xl uppercase tracking-widest ${
          alreadyCheckedIn || loading
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-100'
        }`}
      >
        {loading ? 'PROCESSANDO...' : alreadyCheckedIn ? 'CONCLUÍDO POR HOJE' : 'REALIZAR CHECK-IN'}
      </button>

      <div className="mt-5 flex gap-1.5 justify-between">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full flex-1 transition-all ${
              i < (displayStreak % 30) ? 'bg-emerald-500 shadow-sm shadow-emerald-100' : 'bg-gray-100'
            }`} 
          />
        ))}
      </div>
      <p className="text-[8px] text-gray-300 font-bold uppercase text-center mt-2 tracking-widest">30 dias para o bônus máximo</p>
    </div>
  );
};

export default DailyCheckIn;
