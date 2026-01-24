
import React from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const docs = [
    { label: 'APRESENTAÇÃO OFICIAL (PDF)', url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0' },
    { label: 'TERMOS E CONDIÇÕES', url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0' },
    { label: 'GUIA DO INVESTIDOR', url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 relative shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 leading-tight mb-4">
            Seja bem-vindo(a) à Network Invest!
          </h2>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Nossa plataforma foi criada para ajudar pessoas a buscarem oportunidades no mercado global. Explore nossos materiais oficiais abaixo:
          </p>
          
          <div className="space-y-3 mb-8">
            {docs.map((doc, idx) => (
              <button 
                key={idx}
                className="w-full bg-emerald-50 text-emerald-700 font-black py-4 rounded-2xl border border-emerald-100 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                onClick={() => window.open(doc.url, '_blank')}
              >
                {doc.label}
              </button>
            ))}
          </div>
          
          <button 
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"
            onClick={onClose}
          >
            COMEÇAR AGORA
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
