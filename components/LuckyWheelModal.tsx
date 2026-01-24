
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

  const prizes = [0.10, 0.20, 0.30, 0.50, 0.75, 1.00, 0.15, 0.40];
  const weights = [25, 20, 15, 5, 2, 1, 20, 12];

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
      setError('Disponível apenas para VIPs Pagos (VIP 1 ou superior).');
      return;
    }

    if (!canSpinToday()) {
      setError('Você já realizou seu giro diário!');
      return;
    }

    setSpinning(true);
    setResult(null);
    setError(null);

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
    const spinCount = 10;
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
        <p className="text-[10px] text-gray-400 mb-8 font-medium">Gire e ganhe bônus em USDT</p>

        <div className="relative w-64 h-64 mb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-30 text-emerald-600 drop-shadow-md">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 21l-8-14h16l-8 14z" /></svg>
          </div>
          
          <div 
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
                   <span className="text-[6px] font-bold opacity-50 uppercase">USDT</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full shadow-lg border-4 border-emerald-50 flex items-center justify-center z-20">
            <span className="text-xl">🔥</span>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 rounded-xl border border-red-100 text-center"><p className="text-[10px] font-bold text-red-600 leading-tight uppercase">{error}</p></div>}
        {result !== null && <div className="mb-6 animate-bounce text-center"><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Você Ganhou!</p><p className="text-2xl font-black text-emerald-800">+{result.toFixed(2)} USDT</p></div>}

        <button disabled={spinning} onClick={handleSpin} className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${spinning ? 'bg-gray-100 text-gray-300' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 active:scale-95'}`}>{spinning ? 'GIRANDO...' : 'GIRAR AGORA'}</button>
      </div>
    </div>
  );
};

export default LuckyWheelModal;
