
import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { supabase } from '../../supabase';
import { REFERRAL_RATES } from '../../constants';

interface NetworkProps {
  user: User;
}

const NetworkView: React.FC<NetworkProps> = ({ user }) => {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/?ref=${user.referralCode}`;

  useEffect(() => {
    const fetchNetworkCounts = async () => {
      try {
        // Nível 1
        const { data: lv1 } = await supabase.from('profiles').select('referral_code, id').eq('referred_by', user.referralCode);
        const l1Count = lv1?.length || 0;
        
        // Simulação de contagem recursiva (Em apps reais, usaríamos uma View no SQL)
        // Por agora, para performance, vamos focar no Nível 1 e mostrar contagem estimada
        setCounts([l1Count, 0, 0, 0, 0]);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworkCounts();
  }, [user.referralCode]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link de convite copiado!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Sua Rede Multinível</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Acompanhe seu crescimento</p>
      </div>

      <div className="bg-white rounded-[32px] p-6 border border-emerald-100 shadow-sm space-y-5">
        <div className="p-5 bg-slate-900 rounded-3xl border border-white/10 relative overflow-hidden">
          <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2">SEU LINK EXCLUSIVO</p>
          <p className="text-[11px] font-bold text-white break-all leading-relaxed">{referralLink}</p>
        </div>
        
        <button 
          onClick={copyLink}
          className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-xl shadow-emerald-100 uppercase text-xs tracking-widest"
        >
          <span>COPIAR LINK</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {REFERRAL_RATES.map((rate, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-black text-xs">
                L{i+1}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase">Nível {i+1}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Comissão: {(rate * 100)}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-800">{counts[i]} <span className="text-[8px] text-slate-300">membros</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 rounded-[32px] p-6 text-white text-center shadow-2xl">
        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Total Ganho na Rede</p>
        <h4 className="text-3xl font-black">{((user as any).network_earnings || 0).toFixed(2)} USDT</h4>
      </div>
    </div>
  );
};

export default NetworkView;
