
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
  
  // Detecta automaticamente o domínio onde o site está hospedado
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://networkinvest.com';
  const referralLink = `${baseUrl}/?ref=${user.referralCode}`;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Nível 1: Diretos (Busca real no banco)
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('referred_by', user.referralCode);
        
        if (!error) {
          // Por enquanto mostramos o Nível 1 real. 
          // Os outros níveis são calculados conforme a rede cresce.
          setCounts([count || 0, 0, 0, 0, 0]);
        }
      } catch (err) {
        console.error("Erro ao buscar rede:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [user.referralCode]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link de convite copiado com sucesso!');
  };

  return (
    <div className="p-6 space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">EXPANSÃO GLOBAL</h2>
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">Sua Rede Multinível de Parceiros</p>
      </div>

      <div className="bg-white rounded-[35px] p-7 border border-emerald-100 shadow-sm space-y-6">
        <div className="p-6 bg-slate-900 rounded-[28px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
          <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 text-center">SEU LINK DE CONVITE EXCLUSIVO</p>
          <p className="text-[11px] font-bold text-white break-all leading-relaxed text-center select-all mb-4 px-2">
            {referralLink}
          </p>
          <button 
            onClick={copyLink}
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>COPIAR LINK AGORA</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estrutura de Bonificação</h3>
          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">5 Níveis</span>
        </div>
        
        {REFERRAL_RATES.map((rate, i) => (
          <div key={i} className="bg-white rounded-[24px] p-5 flex items-center justify-between border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs shadow-inner">
                L{i+1}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Nível {i+1}</p>
                <p className="text-[8px] text-emerald-500 font-black uppercase">Lucro: {(rate * 100)}% por ativação</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-800 tracking-tighter">
                {counts[i]} <span className="text-[8px] text-slate-300 font-bold uppercase">Membros</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 rounded-[35px] p-8 text-white shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-1">Total Recebido da Rede</p>
          <h4 className="text-3xl font-black italic tracking-tighter">
            {((user as any).network_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm opacity-40">USDT</span>
          </h4>
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
};

export default NetworkView;
