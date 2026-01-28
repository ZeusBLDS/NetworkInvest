
import React from 'react';

interface OfficialNoticeModalProps {
  onClose: () => void;
}

const OfficialNoticeModal: React.FC<OfficialNoticeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-8 relative shadow-2xl animate-in zoom-in duration-300 border-4 border-emerald-500/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📢</span>
          </div>
          
          <h2 className="text-lg font-black text-slate-900 leading-tight uppercase italic tracking-tighter">
            INFORMATIVO OFICIAL<br/>NETWORK INVEST
          </h2>
          
          <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-4 border border-slate-100">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">⏰ HORÁRIOS IMPORTANTES</p>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-700">
                  <span className="mr-1">💸</span> <span className="font-black text-slate-900">SAQUES:</span> Segunda a sexta-feira, das 17h às 22h.
                </p>
                <p className="text-[11px] font-bold text-slate-700">
                  <span className="mr-1">🎯</span> <span className="font-black text-slate-900">TAREFAS:</span> Disponíveis somente de segunda a sexta-feira. (Sábado e domingo não há tarefas).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] font-bold text-amber-600 leading-relaxed">
                <span className="font-black underline">IMPORTANTE:</span> Após solicitar o saque, finalize no site para processamento. Solicitações fora do horário não serão processadas.
              </p>
            </div>
          </div>

          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest py-2">
            🚀 ORGANIZAÇÃO E TRANSPARÊNCIA
          </p>
          
          <button 
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest"
            onClick={onClose}
          >
            ESTOU CIENTE
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficialNoticeModal;
