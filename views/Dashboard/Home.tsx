
import React from 'react';
import { User, Notification, DepositRequest } from '../../types';
import DailyCheckIn from '../../components/DailyCheckIn';
import { PLANS } from '../../constants';

interface HomeProps {
  user: User;
  myDeposits: DepositRequest[];
  updateBalance: (amount: number) => void;
  performCheckIn: () => Promise<number | undefined>;
  addNotification: (type: Notification['type'], message: string) => void;
  onOpenWithdraw: () => void;
  onOpenDeposit: () => void;
  onOpenWheel: () => void;
}

const Home: React.FC<HomeProps> = ({ user, myDeposits, performCheckIn, onOpenWithdraw, onOpenDeposit, onOpenWheel }) => {
  const activePlanName = PLANS.find(p => p.id === user.activePlanId)?.name || 'Nenhum Plano Ativo';
  
  const docs = [
    { label: 'PDF Completo', url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0', icon: '📄' },
    { label: 'Tabela VIP 90 Dias', url: 'https://www.dropbox.com/scl/fi/62z7x3pmvxo261dtw6u30/Network_Invest_PDF_Completo.pdf?rlkey=ud1fybfe5o4w2r3agnmkzg93k&st=ofi9inbd&dl=0', icon: '📊' }
  ];

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-700 bg-slate-50 min-h-screen">
      {/* Saldo Principal */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[35px] p-7 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center opacity-50 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Balanço USDT</span>
          </div>
          <div className="flex items-baseline space-x-2 mb-8">
            <h2 className="text-4xl font-black tracking-tighter">
              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-emerald-400 font-bold text-xs uppercase">usdt</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onOpenDeposit} className="bg-emerald-500 text-slate-900 font-black py-4 rounded-2xl text-[10px] uppercase active:scale-95 transition-all shadow-lg">Depositar</button>
            <button onClick={onOpenWithdraw} className="bg-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase border border-white/10 active:scale-95 transition-all">Sacar</button>
          </div>
        </div>
      </div>

      {/* Informativo Oficial Card */}
      <div className="bg-white border-2 border-emerald-500/10 rounded-[32px] p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-4">
           <span className="text-xl">📢</span>
           <h4 className="text-[11px] font-black text-slate-800 uppercase italic tracking-tight">Informativo Oficial NI</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <span className="text-emerald-500 text-xs mt-0.5">⏱</span>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
              <span className="text-slate-900">SAQUES:</span> Seg-Sex, 17h às 22h.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-emerald-500 text-xs mt-0.5">🎯</span>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
              <span className="text-slate-900">TAREFAS:</span> Apenas dias úteis.
            </p>
          </div>
        </div>
      </div>

      {/* Botão WhatsApp Grupo */}
      <button 
        onClick={() => window.open('https://chat.whatsapp.com/FswIG8yXGycGZxnRTpy7qD?mode=gi_t', '_blank')}
        className="w-full bg-[#25D366] text-white rounded-[28px] p-5 shadow-lg shadow-green-100 flex items-center justify-between active:scale-[0.98] transition-all"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs font-black uppercase tracking-tight">Grupo Oficial</p>
            <p className="text-[9px] opacity-80 font-bold uppercase tracking-widest">Junte-se à nossa comunidade</p>
          </div>
        </div>
        <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Plano Ativo */}
      <div className="space-y-3">
        <div className="bg-white border border-slate-100 p-5 rounded-[28px] flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Plano em Operação</p>
              <p className="text-sm font-black text-slate-800 uppercase">{activePlanName}</p>
            </div>
          </div>
          <div className="text-right">
             <span className={`text-[9px] ${user.activePlanId ? 'bg-emerald-500' : 'bg-slate-300'} text-white px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-emerald-100`}>
               {user.activePlanId ? 'Ativo' : 'Nenhum'}
             </span>
          </div>
        </div>
      </div>

      <DailyCheckIn user={user} onCheckIn={performCheckIn} />

      {/* Lucky Spin Button */}
      <button onClick={onOpenWheel} className="w-full bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">🎡</div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Roleta da Sorte</p>
            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Giro Diário Disponível</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* DOCUMENTAÇÃO & GUIAS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Documentação & Guias</h3>
        <div className="bg-white rounded-[32px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
          {docs.map((doc, idx) => (
            <button 
              key={idx}
              onClick={() => window.open(doc.url, '_blank')}
              className="w-full p-5 flex items-center justify-between active:bg-slate-50 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">{doc.icon}</div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{doc.label}</span>
              </div>
              <svg className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
};

export default Home;
