
import React, { useState } from 'react';
import { User, DepositRequest, WithdrawRequest } from '../../types';
import { PLANS } from '../../constants';

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
  onApproveDeposit, onRejectDeposit, onApproveWithdraw, onRejectWithdraw
}) => {
  const [activeTab, setActiveTab] = useState<'DASH' | 'USERS' | 'FINANCE'>('DASH');

  const totalInvested = users.reduce((sum, u) => sum + (u.totalInvested || 0), 0);
  const totalPaid = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 italic">ADMIN PANEL</h2>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-xl text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex p-4 gap-2 bg-white border-b border-gray-100 sticky top-[73px] z-10 overflow-x-auto">
        <button onClick={() => setActiveTab('DASH')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${activeTab === 'DASH' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>Resumo</button>
        <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${activeTab === 'USERS' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>Usuários ({users.length})</button>
        <button onClick={() => setActiveTab('FINANCE')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${activeTab === 'FINANCE' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>Financeiro</button>
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
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Investido</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 col-span-2">
              <p className="text-2xl font-black text-blue-600">{totalPaid.toFixed(2)} USDT</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Pago em Saques</p>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">{u.name}</p>
                  <p className="text-[10px] text-gray-400">{u.email}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Plano: {u.activePlanId}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-700">{u.balance.toFixed(2)}</p>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest">Saldo USDT</p>
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
                    <p className="text-xs font-bold">{req.userName}</p>
                    <p className="text-xs font-black text-emerald-600">{req.amount} USDT</p>
                  </div>
                  <p className="text-[8px] font-mono text-gray-400 break-all bg-gray-50 p-2 rounded mb-3">HASH: {req.hash}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-lg">APROVAR</button>
                    <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2 rounded-lg">RECUSAR</button>
                  </div>
                </div>
              ))}
            </section>
            
            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase mb-3">Saques Pendentes</h3>
              {withdrawals.filter(w => w.status === 'PENDING').map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3">
                  <p className="text-xs font-bold">{req.userName} - {req.amount} USDT</p>
                  <p className="text-[8px] text-gray-400 mb-3">{req.wallet}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg">MARCAR PAGO</button>
                    <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2 rounded-lg">RECUSAR</button>
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
