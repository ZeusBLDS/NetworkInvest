
import React, { useState } from 'react';
import { User, DepositRequest, WithdrawRequest } from '../../types';
import { PLANS } from '../../constants';

interface AdminPanelProps {
  users: User[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  depositWallet: string;
  onUpdateWallet: (w: string) => void;
  onClose: () => void;
  onApproveDeposit: (id: string) => void;
  onRejectDeposit: (id: string) => void;
  onApproveWithdraw: (id: string) => void;
  onRejectWithdraw: (id: string) => void;
  onUpdateStatus: (userId: string, status: 'ACTIVE' | 'BLOCKED') => void;
  onDeleteUser: (userId: string) => void;
  onGivePlan: (userId: string, planId: string) => void;
  onAdjustBalance: (userId: string, amount: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, deposits, withdrawals, depositWallet, onUpdateWallet, onClose, 
  onApproveDeposit, onRejectDeposit, onApproveWithdraw, onRejectWithdraw,
  onUpdateStatus, onGivePlan, onAdjustBalance
}) => {
  const [activeTab, setActiveTab] = useState<'DASH' | 'USERS' | 'FINANCE' | 'CONFIG'>('DASH');
  const [financeSubTab, setFinanceSubTab] = useState<'DEPOSITS' | 'WITHDRAWS'>('DEPOSITS');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black">NI</div>
          <h2 className="text-sm font-black uppercase tracking-tighter italic">ADMIN CENTER</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex bg-white border-b overflow-x-auto no-scrollbar">
        {[
          { id: 'DASH', label: 'Dashboard', icon: '📊' },
          { id: 'USERS', label: 'Usuários', icon: '👤' },
          { id: 'FINANCE', label: 'Financeiro', icon: '💰' },
          { id: 'CONFIG', label: 'Ajustes', icon: '⚙️' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 flex flex-col items-center py-4 px-2 min-w-[80px] border-b-4 transition-all ${
              activeTab === tab.id ? 'border-emerald-50 bg-emerald-50' : 'border-transparent text-slate-400'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 flex-1">
        {activeTab === 'FINANCE' && (
          <div className="space-y-6">
            <div className="flex p-1 bg-slate-200 rounded-2xl">
               <button onClick={() => setFinanceSubTab('DEPOSITS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'DEPOSITS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Depósitos</button>
               <button onClick={() => setFinanceSubTab('WITHDRAWS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'WITHDRAWS' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}>Saques</button>
            </div>

            {financeSubTab === 'DEPOSITS' ? (
              <div className="space-y-3">
                {deposits.length === 0 ? (
                   <p className="text-center text-slate-400 text-xs py-10 font-bold uppercase">Sem depósitos no momento</p>
                ) : (
                  deposits.map(req => (
                    <div key={req.id} className={`bg-white p-5 rounded-[30px] border shadow-sm ${req.status === 'PENDING' ? 'border-emerald-200' : 'opacity-60'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase mb-1">{req.userName}</p>
                          <p className="text-[8px] text-slate-400 font-bold">{new Date(req.timestamp).toLocaleString()}</p>
                          <span className="text-[7px] bg-slate-100 px-2 py-0.5 rounded uppercase font-black">{req.status}</span>
                        </div>
                        <p className="text-lg font-black text-emerald-600">{req.amount.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl mb-4 text-[9px] font-mono break-all leading-tight border">
                        HASH: {req.hash || 'Sem Hash'}
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[9px] font-black py-4 rounded-xl uppercase shadow-lg shadow-emerald-50">Aprovar</button>
                          <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black py-4 rounded-xl uppercase">Recusar</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-10 font-bold uppercase">Sem pedidos de saque</p>
                ) : (
                  withdrawals.map(req => (
                    <div key={req.id} className={`bg-white p-5 rounded-[30px] border shadow-sm ${req.status === 'PENDING' ? 'border-amber-200' : 'opacity-60'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase mb-1">{req.userName}</p>
                          <p className="text-[8px] text-slate-400 font-bold">{new Date(req.timestamp).toLocaleString()}</p>
                          <span className="text-[7px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase font-black">{req.status}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-amber-600">{req.amount.toFixed(2)}</p>
                          <p className="text-[7px] text-slate-300 font-bold uppercase">Taxa: {req.fee.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl mb-4 text-white text-[9px] font-mono break-all leading-tight">
                        CARTEIRA: {req.wallet}
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-slate-900 text-white text-[9px] font-black py-4 rounded-xl uppercase shadow-xl">Pagar Agora</button>
                          <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black py-4 rounded-xl uppercase">Recusar</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-3">
             <input type="text" placeholder="Pesquisar usuários..." className="w-full p-4 rounded-2xl bg-white border text-sm font-bold outline-none shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             {filteredUsers.map(u => (
               <div key={u.id} className="bg-white p-5 rounded-[30px] border shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-black text-slate-800 uppercase tracking-tighter italic">{u.name}</p>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                      <p className="text-[7px] font-black text-slate-300 uppercase">Saldo</p>
                      <p className="text-xs font-black text-emerald-600">{u.balance.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                      <p className="text-[7px] font-black text-slate-300 uppercase">Plano</p>
                      <p className="text-xs font-black text-slate-800 uppercase">{u.activePlanId || 'VIP 0'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { const val = prompt('Valor (+/-):'); if(val) onAdjustBalance(u.id, parseFloat(val)); }} className="flex-1 bg-slate-900 text-white text-[8px] font-black py-3 rounded-lg uppercase">Saldo</button>
                    <button onClick={() => { const pid = prompt('Plano (vip1, vip2...):'); if(pid) onGivePlan(u.id, pid); }} className="flex-1 bg-emerald-600 text-white text-[8px] font-black py-3 rounded-lg uppercase">Plano</button>
                    <button onClick={() => onUpdateStatus(u.id, u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')} className="flex-1 bg-amber-500 text-white text-[8px] font-black py-3 rounded-lg uppercase">Status</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'DASH' && (
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-3xl border shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase">Total Usuários</p>
                <p className="text-2xl font-black text-slate-800">{users.length}</p>
             </div>
             <div className="bg-white p-5 rounded-3xl border shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase">Saques Pendentes</p>
                <p className="text-2xl font-black text-amber-500">{withdrawals.filter(w => w.status === 'PENDING').length}</p>
             </div>
             <div className="bg-white p-5 rounded-3xl border shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase">Deps. Pendentes</p>
                <p className="text-2xl font-black text-emerald-500">{deposits.filter(d => d.status === 'PENDING').length}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
