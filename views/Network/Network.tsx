
import React from 'react';
import { User } from '../../types';
import { REFERRAL_RATES } from '../../constants';

interface NetworkProps {
  user: User;
}

const NetworkView: React.FC<NetworkProps> = ({ user }) => {
  // Captura o domínio atual dinamicamente (Netlify, Vercel ou Domínio Próprio)
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}?ref=${user.referralCode}`;

  const stats = [
    { level: 1, percent: 5, count: 0, earnings: 0 },
    { level: 2, percent: 3, count: 0, earnings: 0 },
    { level: 3, percent: 1, count: 0, earnings: 0 },
    { level: 4, percent: 1, count: 0, earnings: 0 },
    { level: 5, percent: 1, count: 0, earnings: 0 }
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link de indicação copiado com sucesso!');
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sua Rede</h2>
        <p className="text-gray-500 text-sm">Convide amigos e ganhe bônus em USDT</p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seu Link de Indicação</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{referralLink}</p>
          </div>
        </div>
        
        <button 
          onClick={copyLink}
          className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-emerald-100 uppercase text-xs tracking-widest"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          <span>COPIAR LINK</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">0</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Indicados</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">0.00</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ganhos de Rede</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase px-1 tracking-widest">Ganhos por Nível</h3>
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.level} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-xs">
                  {stat.level}º
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Nível {stat.level}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">{stat.percent}% de Bônus</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800 text-sm">{stat.count} <span className="text-[10px] text-gray-400 font-medium">indicados</span></p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.earnings.toFixed(2)} USDT</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkView;
