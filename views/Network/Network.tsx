
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
  
  const getReferralLink = () => {
    if (typeof window === 'undefined') return '';
    const code = user.referralCode || '';
    if (!code) return '';
    return `${window.location.origin}/?ref=${code}`;
  };

  const referralLink = getReferralLink();

  useEffect(() => {
    const fetchFullNetwork = async () => {
      try {
        if (!user.referralCode) return;
        
        // Nível 1 (Diretos)
        const { data: level1, error: e1 } = await supabase.from('profiles').select('referral_code').eq('referred_by', user.referralCode);
        if (e1) throw e1;
        
        const L1_codes = level1?.map(m => m.referral_code) || [];
        const newCounts = [L1_codes.length, 0, 0, 0, 0];

        // Nível 2
        if (L1_codes.length > 0) {
          const { data: level2 } = await supabase.from('profiles').select('referral_code').in('referred_by', L1_codes);
          const L2_codes = level2?.map(m => m.referral_code) || [];
          newCounts[1] = L2_codes.length;

          // Nível 3
          if (L2_codes.length > 0) {
            const { data: level3 } = await supabase.from('profiles').select('referral_code').in('referred_by', L2_codes);
            const L3_codes = level3?.map(m => m.referral_code) || [];
            newCounts[2] = L3_codes.length;

            // Nível 4
            if (L3_codes.length > 0) {
               const { data: level4 } = await supabase.from('profiles').select('referral_code').in('referred_by', L3_codes);
               const L4_codes = level4?.map(m => m.referral_code) || [];
               newCounts[3] = L4_codes.length;

               // Nível 5
               if (L4_codes.length > 0) {
                 const { data: level5 } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).in('referred_by', L4_codes);
                 newCounts[4] = level5?.length || 0;
               }
            }
          }
        }
        
        setCounts(newCounts);
      } catch (err) {
        console.error("Erro contagem rede:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullNetwork();
  }, [user.referralCode]);

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    alert('Link copiado!');
  };

  return (
    <div className="p-6 space-y-7 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">EXPANSÃO GLOBAL</h2>
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">Gestão de Rede Multinível</p>
      </div>

      <div className="bg-slate-900 rounded-[35px] p-7 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full"></div>
        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-3 text-center">CONVITE EXCLUSIVO</p>
        
        <div className="bg-white/5 p-4 rounded-2xl mb-6 border border-white/5">
          <p className="text-[10px] font-bold text-white break-all text-center opacity-80 font-mono">
            {referralLink || 'SINCRONIZANDO...'}
          </p>
        </div>

        <button 
          onClick={copyLink}
          disabled={!referralLink}
          className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          <span>COPIAR MEU LINK</span>
        </button>
      </div>

      <div className="space-y-3">
        {REFERRAL_RATES.map((rate, i) => (
          <div key={i} className="bg-white rounded-[24px] p-5 flex items-center justify-between border border-gray-100 shadow-sm group">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors">L{i+1}</div>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Nível {i+1}</p>
                <p className="text-[8px] text-emerald-500 font-black uppercase">Comissão: {(rate * 100)}%</p>
              </div>
            </div>
            <p className="text-sm font-black text-slate-800 tracking-tight">
              {loading ? '...' : counts[i]} <span className="text-[8px] text-slate-300 uppercase">filiados</span>
            </p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 rounded-[35px] p-8 text-white shadow-2xl relative overflow-hidden text-center group border border-white/5">
        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 relative z-10">LUCRO TOTAL DA REDE</p>
        <h4 className="text-3xl font-black italic tracking-tighter relative z-10">
          {(user.network_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm opacity-40 uppercase font-normal">usdt</span>
        </h4>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default NetworkView;
