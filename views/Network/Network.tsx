
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
        
        // Nível 1
        const { data: level1 } = await supabase.from('profiles').select('referral_code').eq('referred_by', user.referralCode);
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
                 const { data: level5 } = await supabase.from('profiles').select('referral_code').in('referred_by', L4_codes);
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
    alert('Link de convite copiado!');
  };

  return (
    <div className="p-6 space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">ALCANCE GLOBAL</h2>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Sua Estrutura de Negócios</p>
      </div>

      {/* Link Card Principal */}
      <div className="bg-slate-900 rounded-[40px] p-8 border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center">
          <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-4">COMPARTILHE SEU LINK</p>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl mb-8 border border-white/10 shadow-inner">
            <p className="text-[10px] font-mono text-white break-all opacity-90 leading-relaxed">
              {referralLink || 'Gerando link seguro...'}
            </p>
          </div>
          <button 
            onClick={copyLink}
            disabled={!referralLink}
            className="w-full bg-emerald-500 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span>COPIAR LINK</span>
          </button>
        </div>
      </div>

      {/* Níveis Multinível */}
      <div className="space-y-4">
        {REFERRAL_RATES.map((rate, i) => (
          <div key={i} className="bg-white rounded-[28px] p-5 flex items-center justify-between border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors group">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner transition-colors ${counts[i] > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                L{i+1}
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Nível {i+1}</p>
                <div className="flex items-center space-x-2">
                   <span className="text-[8px] font-black text-emerald-500 uppercase">Comissão {(rate * 100)}%</span>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <span className="text-[8px] font-black text-slate-300 uppercase">Diretos & Indiretos</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-800 tabular-nums">
                {loading ? '...' : counts[i]}
              </p>
              <p className="text-[8px] text-slate-300 font-bold uppercase">Membros</p>
            </div>
          </div>
        ))}
      </div>

      {/* Card de Ganhos */}
      <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20"></div>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">RECOMPENSA ACUMULADA</p>
        <div className="flex items-baseline justify-center space-x-2">
           <h4 className="text-4xl font-black text-emerald-900 italic tracking-tighter">
             {(user.network_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
           </h4>
           <span className="text-xs font-black text-emerald-600 uppercase">usdt</span>
        </div>
        <p className="text-[8px] text-emerald-400 font-black uppercase mt-3 tracking-widest opacity-60">Pagamento Automático via Blockchain</p>
      </div>

      <div className="h-24" />
    </div>
  );
};

export default NetworkView;
