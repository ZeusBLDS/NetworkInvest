
import React, { useState, useRef } from 'react';
import { User } from '../types';

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
  const wheelRef = useRef<HTMLDivElement>(null);

  // Prizes in the wheel slices order
  const prizes = [0.10, 0.20, 0.30, 0.50, 0.75, 1.00, 0.15, 0.40];
  
  // Custom probabilities (weights summing to 100)
  // Higher value prizes have much lower chance
  const weights = [
    25, // 0.10
    20, // 0.20
    15, // 0.30
    5,  // 0.50 (low)
    2,  // 0.75 (very low)
    1,  // 1.00 (extremely low)
    20, // 0.15
    12  // 0.40
  ];

  const canSpinToday = () => {
    if (!user.lastWheelSpin) return true;
    const lastSpin = new Date(user.lastWheelSpin).toDateString();
    const today = new Date().toDateString();
    return lastSpin !== today;
  };

  const isPaidUser = user.activePlanId && user.activePlanId !== 'vip0';

  const handleSpin = () => {
    if (spinning) return;
    
    if (!isPaidUser) {
      setError('Disponível apenas para usuários com Planos Pagos ativos.');
      return;
    }

    if (!canSpinToday()) {
      setError('Você já realizou seu giro hoje. Volte amanhã!');
      return;
    }

    setSpinning(true);
    setResult(null);
    setError(null);

    // Weighted random selection
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
    const spinCount = 8 + Math.floor(Math.random() * 5); // 8 to 12 full spins
    
    // Calculate final rotation to land on selectedIndex
    // Normalized angle 0 is prize[0]. normalizedAngle increases clockwise.
    // The pointer is at the top (angle 0 in wheel space).
    // To land a slice at the pointer, we need to rotate the wheel by - (sliceAngle * index)
    // plus some random offset within the slice to avoid perfectly centered landing every time.
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
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-emerald-950/90 backdrop-blur-md p-6">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-300">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-black text-emerald-800 mb-2 italic uppercase tracking-tighter">ROLETA DA SORTE</h2>
        <p className="text-xs text-gray-400 mb-8 font-medium">Prêmios de 0.10 a 1.00 USDT</p>

        {/* The Wheel */}
        <div className="relative w-64 h-64 mb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-30 text-emerald-600 drop-shadow-md">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 21l-8-14h16l-8 14z" /></svg>
          </div>
          
          <div 
            ref={wheelRef}
            className="w-full h-full rounded-full border-8 border-emerald-50 shadow-inner relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.15,0,0.15,1)] z-10"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((p, i) => (
              <div 
                key={i}
                className={`absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-start justify-center pt-4 ${i % 2 === 0 ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-emerald-50'}`}
                style={{ transform: `rotate(${i * (360 / prizes.length)}deg)` }}
              >
                <div className="flex flex-col items-center rotate-[22.5deg] mt-2">
                   <span className="font-black text-[10px]">{p.toFixed(2)}</span>
                   <span className="text-[6px] font-bold opacity-50">USDT</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Center piece */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full shadow-lg border-4 border-emerald-50 flex items-center justify-center z-20">
            <span className="text-xl">⭐</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 rounded-xl border border-red-100 text-center">
             <p className="text-[10px] font-bold text-red-600 leading-tight uppercase">{error}</p>
          </div>
        )}

        {result !== null && (
          <div className="mb-6 animate-bounce text-center">
             <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Resultado:</p>
             <p className="text-2xl font-black text-emerald-800">+{result.toFixed(2)} USDT</p>
          </div>
        )}

        <button 
          disabled={spinning}
          onClick={handleSpin}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${
            spinning
            ? 'bg-gray-100 text-gray-300'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 active:scale-95'
          }`}
        >
          {spinning ? 'GIRANDO...' : 'GIRAR AGORA'}
        </button>

        <div className="mt-6 flex flex-col items-center space-y-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Limite: 1 giro / 24h</p>
          <p className="text-[8px] text-emerald-600/50 font-medium italic">Vips Pagos possuem acesso exclusivo</p>
        </div>
      </div>
    </div>
  );
};

export default LuckyWheelModal;
