
import React from 'react';

interface VipZeroModalProps {
  onActivate: () => void;
}

const VipZeroModal: React.FC<VipZeroModalProps> = ({ onActivate }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-t-[40px] w-full max-w-md p-8 animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-inner animate-float">
            <span className="text-4xl">⚡</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 italic tracking-tighter uppercase">Presente Ativado!</h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">VIP Experiência de 3 Dias</p>
        </div>
        
        <div className="bg-emerald-50 rounded-[35px] p-6 mb-8 border-2 border-emerald-100 shadow-inner">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">💰 Rendimento Extra</span>
              <span className="text-emerald-900 font-black italic">0.30 USDT / Dia</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">⏳ Tempo de Teste</span>
              <span className="text-emerald-900 font-black italic">3 Dias Corridos</span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-200 pt-4">
              <span className="text-emerald-700 font-black text-[11px] uppercase tracking-widest">Acúmulo Total</span>
              <span className="text-emerald-900 font-black text-2xl italic tracking-tighter">0.90 USDT</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-[25px] mb-8">
           <p className="text-[9px] text-emerald-400 font-black uppercase text-center leading-relaxed">
             Para sacar este valor e seus lucros futuros, você precisará atingir o mínimo de <span className="text-white underline">9.00 USDT</span> com nossos planos VIP.
           </p>
        </div>
        
        <button 
          onClick={onActivate}
          className="w-full bg-slate-900 text-emerald-400 font-black py-5 rounded-[22px] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest border-b-4 border-emerald-900"
        >
          COLETAR MEU BÔNUS 🎁
        </button>
      </div>
    </div>
  );
};

export default VipZeroModal;
