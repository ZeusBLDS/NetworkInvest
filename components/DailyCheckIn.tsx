
import React from 'react';
import { User } from '../types';

interface DailyCheckInProps {
  user: User;
  onCheckIn: (amount: number) => void;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ user, onCheckIn }) => {
  const lastCheckInDate = user.lastCheckIn ? new Date(user.lastCheckIn).toDateString() : '';
  const today = new Date().toDateString();
  const canCheckIn = lastCheckInDate !== today;

  const currentDay = user.checkInStreak % 30 + 1;
  const earningToday = currentDay * 0.01;

  const handleCheckIn = () => {
    if (!canCheckIn) return;
    onCheckIn(earningToday);
    // Logic for streak increment/reset would usually happen in parent
    user.checkInStreak += 1;
    user.lastCheckIn = Date.now();
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Check-in Diário</h3>
          <p className="text-xs text-gray-400">Dia {currentDay} de 30</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
          <span className="text-emerald-600 text-lg font-bold">🎁</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 mb-4">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase">Recompensa de Hoje</p>
          <p className="text-xl font-black text-emerald-800">{earningToday.toFixed(2)} USDT</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-emerald-600 uppercase">Sequência</p>
          <p className="text-xl font-black text-emerald-800">{user.checkInStreak} dias</p>
        </div>
      </div>

      <button
        disabled={!canCheckIn}
        onClick={handleCheckIn}
        className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${
          canCheckIn 
          ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-100' 
          : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
        }`}
      >
        {canCheckIn ? 'REALIZAR CHECK-IN' : 'VOLTE AMANHÃ'}
      </button>

      <div className="mt-4 flex space-x-2 overflow-hidden opacity-50">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-1 rounded-full ${i < (user.checkInStreak % 7) ? 'bg-emerald-500' : 'bg-gray-200'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default DailyCheckIn;
