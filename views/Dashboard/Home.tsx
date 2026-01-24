
import React, { useState } from 'react';
import { User, Notification } from '../../types';
import DailyCheckIn from '../../components/DailyCheckIn';
import { PLANS } from '../../constants';

interface HomeProps {
  user: User;
  updateBalance: (amount: number) => void;
  performCheckIn: () => Promise<number | undefined>;
  addNotification: (type: Notification['type'], message: string) => void;
  onOpenWithdraw: () => void;
  onOpenDeposit: () => void;
  onOpenWheel: () => void;
}

const Home: React.FC<HomeProps> = ({ user, updateBalance, performCheckIn, addNotification, onOpenWithdraw, onOpenDeposit, onOpenWheel }) => {
  const activePlan = PLANS.find(p => p.id === user.activePlanId);
  const whatsappLink = "https://chat.whatsapp.com/E9QatpPzxOF1lXRw8DKPlX?mode=gi_t";

  const pdfLinks = [
    { 
      title: 'PDF Completo', 
      icon: '📄', 
      url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0' 
    },
    { 
      title: 'Tabela VIP 90 Dias', 
      icon: '📊', 
      url: 'https://www.dropbox.com/scl/fi/sbbbbwno2nois5ssj3m0s/Network_Invest_Tabela_VIP_90_Dias.pdf?rlkey=y9p5fb0hegz2v6kcynodjf2zs&st=875rm74g&dl=0' 
    }
  ];

  const handleCheckIn = async () => {
    const reward = await performCheckIn();
    if (reward) {
      addNotification('EARNING_CREDITED', `Você ganhou ${reward.toFixed(2)} USDT no check-in diário!`);
    }
    return reward;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium uppercase tracking-widest text-[10px]">Saldo Total</p>
            <h2 className="text-4xl font-black mt-1">
              {user.balance.toFixed(2)} <span className="text-xl font-normal opacity-60">USDT</span>
            </h2>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button 
            onClick={onOpenDeposit}
            className="bg-white text-emerald-700 font-black py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg text-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>DEPÓSITO</span>
          </button>
          <button 
            onClick={onOpenWithdraw}
            className="bg-emerald-500/30 hover:bg-emerald-500/50 text-white font-black py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all border border-white/20 text-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>SAQUE</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Community Button */}
      <a 
        href={whatsappLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all shadow-lg shadow-emerald-100/50"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div className="text-left">
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Suporte & Comunidade</p>
            <p className="font-bold text-white">Entrar no Grupo WhatsApp</p>
          </div>
        </div>
        <div className="bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
          JOIN
        </div>
      </a>

      {/* Roleta Card */}
      <button 
        onClick={onOpenWheel}
        className="w-full bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors">
            <span className="text-2xl">🎰</span>
          </div>
          <div className="text-left">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Bônus Extra</p>
            <p className="font-bold text-gray-800">Roleta da Sorte</p>
          </div>
        </div>
        <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
          Girar
        </div>
      </button>

      {/* Plan Status Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Meu Plano Atual</p>
            <p className="font-bold text-gray-800">{activePlan ? activePlan.name : 'VIP 0'}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
            {activePlan ? 'Ativo' : 'Padrão'}
          </span>
        </div>
      </div>

      {/* Check-in Card */}
      <DailyCheckIn user={user} onCheckIn={handleCheckIn} />

      {/* PDF Links Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase flex items-center px-1 tracking-widest">
          Materiais Oficiais
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {pdfLinks.map((pdf, idx) => (
            <button 
              key={idx} 
              onClick={() => window.open(pdf.url, '_blank')}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{pdf.icon}</span>
                <span className="font-semibold text-gray-700 text-sm">{pdf.title}</span>
              </div>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
