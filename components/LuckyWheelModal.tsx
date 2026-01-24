
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabase';

interface LuckyWheelModalProps {
  user: User;
  onClose: () => void;
  onWin: (amount: number) => void;
}

const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({ user, onClose, onWin }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prizes = [0.01, 0.02, 0.03, 0.05, 0.10, 0.01, 0.02, 0.05];
  const weights = [50, 25, 10, 5, 1, 5, 3, 1];

  const hasActivePaidPlan = user.activePlanId && user.activePlanId !== 'vip0';

  const handleSpin = async () => {
    if (spinning || result !== null) return;
    
    setSpinning(true);
    setError(null);

    // TRAVA IMEDIATA NO BANCO DE DADOS
    const today = new Date().toISOString();
    const { data: profile } = await supabase.from('profiles').select('last_wheel_spin').eq('id', user.id).single();
    
    if (profile?.last_wheel_spin && new Date(profile.last_wheel_spin).toDateString() === new Date().toDateString()) {
      setSpinning(false);
      setError('Você já girou hoje!');
      return;
    }

    if (!hasActivePaidPlan) {
      setSpinning(false);
      setError('Exclusivo para VIP 1 ou superior.');
      return;
    }

    // Marca no banco que o usuário iniciou o giro (Prevenir bug de clique rápido)
    await supabase.from('profiles').update({ last_wheel_spin: today }).eq('id', user.id);

    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        selectedIndex = i;
        break;
      }
      random -= weights[i];
    }

    const sliceAngle = 360 / prizes.length;
    const spinCount = 8;
    const sliceOffset = Math.random() * (sliceAngle * 0.8) + (sliceAngle * 0.1);
    const targetAngle = 360 - (selectedIndex * sliceAngle) - sliceOffset;
    const totalDegrees = rotation + (spinCount * 360) + (targetAngle - (rotation % 360));
    
    setRotation(totalDegrees);

    setTimeout(() => {
      setSpinning(false);
      const prize = prizes[selectedIndex];
      setResult(prize);
      onWin(prize);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-emerald-950/95 backdrop-blur-xl p-6">
      <div className="bg-white rounded-[50px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden flex flex-col items-center animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-black text-emerald-800 mb-2 italic uppercase tracking-tighter text-center">ROLETA VIP</h2>
        <p className="text-[9px] text-gray-400 mb-10 font-black uppercase tracking-[0.3em] text-center">LUCRO EXTRA DIÁRIO</p>

        <div className="relative w-64 h-64 mb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-7 z-30 text-emerald-500">
            <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24"><path d="M12 21l-8-14h16l-8 14z" /></svg>
          </div>
          
          <div 
            className="w-full h-full rounded-full border-[10px] border-emerald-50 shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.15,0,0.15,1)] z-10"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((p, i) => (
              <div 
                key={i}
                className={`absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-start justify-center pt-5 ${i % 2 === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-emerald-400'}`}
                style={{ transform: `rotate(${i * (360 / prizes.length)}deg)` }}
              >
                <div className="flex flex-col items-center rotate-[22.5deg] mt-2">
                   <span className="font-black text-[11px] leading-none tracking-tighter">{p.toFixed(2)}</span>
                   <span className="text-[6px] font-black opacity-50 uppercase">USDT</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full shadow-2xl border-4 border-emerald-50 flex items-center justify-center z-20">
            <span className="text-3xl animate-pulse">💸</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-3xl text-center">
            <p className="text-[10px] font-black text-red-600 uppercase">{error}</p>
          </div>
        )}
        
        {result !== null && (
          <div className="mb-8 animate-bounce text-center bg-emerald-50 p-4 rounded-3xl border border-emerald-100 w-full">
            <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">PRÊMIO GANHO</p>
            <p className="text-3xl font-black text-emerald-900">+{result.toFixed(2)} USDT</p>
          </div>
        )}

        <button 
          disabled={spinning || result !== null} 
          onClick={handleSpin} 
          className={`w-full py-5 rounded-3xl font-black text-sm transition-all shadow-xl uppercase tracking-[0.2em] ${
            spinning || result !== null
            ? 'bg-slate-100 text-slate-300' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {spinning ? 'SORTEANDO...' : result !== null ? 'GIRO CONCLUÍDO' : 'INICIAR GIRO'}
        </button>
      </div>
    </div>
  );
};

export default LuckyWheelModal;
