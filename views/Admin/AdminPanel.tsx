
import React, { useState } from 'react';
import { User, DepositRequest, WithdrawRequest } from '../../types';

interface AdminPanelProps {
  users: User[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
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
  users, deposits, withdrawals, onClose, 
  onApproveDeposit, onRejectDeposit, onApproveWithdraw, onRejectWithdraw,
  onUpdateStatus, onDeleteUser, onGivePlan, onAdjustBalance
}) => {
  const [activeTab, setActiveTab] = useState<'DASH' | 'USERS' | 'FINANCE' | 'PLANS'>('DASH');
  const [searchTerm, setSearchTerm] = useState('');

  const totalInvested = users.reduce((sum, u) => sum + (u.totalInvested || 0), 0);
  const totalPaid = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-xl font-black italic">ADMIN PANEL</h2>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-xl text-gray-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>

      <div className="flex p-4 gap-2 bg-white border-b border-gray-100 sticky top-[73px] z-10 overflow-x-auto no-scrollbar">
        {['DASH', 'USERS', 'FINANCE', 'PLANS'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{tab === 'DASH' ? 'Resumo' : tab === 'USERS' ? 'Usuários' : tab === 'FINANCE' ? 'Financeiro' : 'Planos'}</button>
        ))}
      </div>

      <div className="p-6 pb-24">
        {activeTab === 'DASH' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
               <p className="text-3xl font-black text-emerald-600">{users.length}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase">Usuários</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
               <p className="text-xl font-black text-emerald-600">{totalInvested.toFixed(2)}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase">Investido (USDT)</p>
            </div>
            <div className="bg-emerald-900 col-span-2 p-6 rounded-3xl text-white shadow-xl">
               <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Lucro Total</p>
               <h3 className="text-4xl font-black">{(totalInvested - totalPaid).toFixed(2)} USDT</h3>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <input type="text" placeholder="Buscar usuário..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-sm">{u.name}</p>
                    <p className="text-[10px] text-gray-400">{u.email}</p>
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black uppercase border border-emerald-100">{u.activePlanId}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600">{u.balance.toFixed(2)}</p>
                    <p className="text-[8px] text-gray-400 uppercase">Saldo USDT</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { const val = prompt('Saldo p/ Adicionar ou Remover:'); if(val) onAdjustBalance(u.id, parseFloat(val)); }} className="flex-1 bg-gray-900 text-white text-[9px] font-black py-2 rounded-lg">SALDO</button>
                  <button onClick={() => { const pid = prompt('VIP ID (vip1, vip2, vip3, vip4):'); if(pid) onGivePlan(u.id, pid); }} className="flex-1 bg-blue-600 text-white text-[9px] font-black py-2 rounded-lg">DAR PLANO</button>
                  <button onClick={() => onUpdateStatus(u.id, u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')} className="flex-1 bg-amber-100 text-amber-700 text-[9px] font-black py-2 rounded-lg">{u.status === 'ACTIVE' ? 'BLOQUEAR' : 'ATIVAR'}</button>
                  <button onClick={() => onDeleteUser(u.id)} className="bg-red-50 text-red-600 p-2 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'FINANCE' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase mb-3">Depósitos Pendentes</h3>
              {deposits.filter(d => d.status === 'PENDING').map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold">{req.userName} <span className="text-emerald-600">({req.planId || 'Saldo'})</span></p>
                    <p className="text-xs font-black">{req.amount} USDT</p>
                  </div>
                  <p className="text-[8px] font-mono text-gray-400 mb-3 break-all italic">HASH: {req.hash}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2.5 rounded-xl">APROVAR</button>
                    <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2.5 rounded-xl">RECUSAR</button>
                  </div>
                </div>
              ))}
            </section>
            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase mb-3">Saques Pendentes</h3>
              {withdrawals.filter(w => w.status === 'PENDING').map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3">
                  <p className="text-xs font-bold">{req.userName} - {req.amount} USDT</p>
                  <p className="text-[8px] text-gray-400 font-mono mb-3 truncate">{req.wallet}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-2.5 rounded-xl">MARCAR PAGO</button>
                    <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2.5 rounded-xl">RECUSAR</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
