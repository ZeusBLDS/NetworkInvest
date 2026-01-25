
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
  
  // Garante que o link de indicação seja construído com base no origin atual e no referralCode do usuário
  const getReferralLink = () => {
    if (typeof window === 'undefined' || !user.referralCode) return 'Gerando link...';
    const origin = window.location.origin;
    return `${origin}/?ref=${user.referralCode}`;
  };

  const referralLink = getReferralLink();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (!user.referralCode) return;
        
        // Busca apenas o primeiro nível por enquanto (otimização)
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('referred_by', user.referralCode);
          
        if (!error) setCounts([count || 0, 0, 0, 0, 0]);
      } catch (err) {
        console.error("Erro ao carregar contagem da rede:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [user.referralCode]);

  const copyLink = () => {
    if (!user.referralCode) return;
    navigator.clipboard.writeText(referralLink);
    alert('Link de convite copiado com sucesso!');
  };

  return (
    <div className="p-6 space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">EXPANSÃO GLOBAL</h2>
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">Sua Rede de Parceiros</p>
      </div>

      <div className="bg-slate-900 rounded-[35px] p-7 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full"></div>
        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-3 text-center">LINK DE CONVITE</p>
        
        <div className="bg-white/5 p-4 rounded-2xl mb-6 border border-white/5">
          <p className="text-[10px] font-bold text-white break-all text-center opacity-80 font-mono">
            {user.referralCode ? referralLink : 'CARREGANDO SEU CÓDIGO...'}
          </p>
        </div>

        <button 
          onClick={copyLink}
          disabled={!user.referralCode}
          className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          <span>COPIAR LINK</span>
        </button>
      </div>

      <div className="space-y-3">
        {REFERRAL_RATES.map((rate, i) => (
          <div key={i} className="bg-white rounded-[24px] p-5 flex items-center justify-between border border-gray-100 shadow-sm transition-all hover:border-emerald-100">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs shadow-inner">L{i+1}</div>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Nível {i+1}</p>
                <p className="text-[8px] text-emerald-500 font-black uppercase">Bônus: {(rate * 100)}%</p>
              </div>
            </div>
            <p className="text-sm font-black text-slate-800 tracking-tight">
              {loading && i === 0 ? '...' : counts[i]} <span className="text-[8px] text-slate-300 uppercase">membros</span>
            </p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 rounded-[35px] p-8 text-white shadow-2xl relative overflow-hidden text-center group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 relative z-10">Ganhos de Equipe</p>
        <h4 className="text-3xl font-black italic tracking-tighter relative z-10">
          {(user.network_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm opacity-40 uppercase font-normal">usdt</span>
        </h4>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default NetworkView;
