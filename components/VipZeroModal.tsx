
import React from 'react';

interface VipZeroModalProps {
  onActivate: () => void;
}

const VipZeroModal: React.FC<VipZeroModalProps> = ({ onActivate }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-t-[40px] w-full max-w-md p-8 animate-in slide-in-from-bottom duration-500">
        <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-8" />
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Boas-vindas!</h2>
          <p className="text-gray-500 font-medium">Você recebeu automaticamente o Plano VIP 0.</p>
        </div>
        
        <div className="bg-emerald-50 rounded-3xl p-6 mb-8 border border-emerald-100">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-bold text-sm">💰 Ganho diário</span>
              <span className="text-emerald-900 font-black">0,10 USDT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-bold text-sm">⏳ Validade</span>
              <span className="text-emerald-900 font-black">90 dias</span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-200 pt-4">
              <span className="text-emerald-700 font-bold text-sm uppercase">Rendimento Total</span>
              <span className="text-emerald-900 font-black text-xl">9.00 USDT</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 text-center mb-8 leading-relaxed">
          Ideal para iniciantes começarem a ganhar diariamente de forma simples e segura 🚀
        </p>
        
        <button 
          onClick={onActivate}
          className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 active:scale-95 transition-all text-lg"
        >
          ATIVAR MEU PLANO GRATUITO
        </button>
      </div>
    </div>
  );
};

export default VipZeroModal;
