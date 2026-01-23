
import React, { useState } from 'react';
import { User, DepositRequest, WithdrawRequest, Plan } from '../../types';
import { PLANS, APP_CONFIG } from '../../constants';

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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Stats calculation
  const totalInvested = users.reduce((sum, u) => sum + (u.totalInvested || 0), 0);
  const totalPaid = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);
  const platformProfit = totalInvested - totalPaid;
  const activeVips = users.filter(u => u.activePlanId && u.activePlanId !== 'vip0').length;

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{users.length}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Usuários Totais</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{activeVips}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Vips Ativos</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xl font-black text-emerald-600">{totalInvested.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Investido (USDT)</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xl font-black text-blue-600">{totalPaid.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Pago (USDT)</p>
        </div>
      </div>

      <div className="bg-emerald-950 rounded-3xl p-6 text-white">
        <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Lucro da Plataforma</p>
        <h3 className="text-4xl font-black">{platformProfit.toFixed(2)} <span className="text-lg font-medium opacity-50">USDT</span></h3>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase px-1">Pendências Críticas</h4>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center justify-between">
          <span className="text-sm font-bold text-amber-800">Depósitos Pendentes</span>
          <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-black">
            {deposits.filter(d => d.status === 'PENDING').length}
          </span>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-center justify-between">
          <span className="text-sm font-bold text-red-800">Saques Pendentes</span>
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black">
            {withdrawals.filter(w => w.status === 'PENDING').length}
          </span>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">Gestão de Usuários</h3>
        <button className="text-xs font-bold text-emerald-600 uppercase">Exportar CSV</button>
      </div>

      {users.map(user => (
        <div key={user.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-gray-900">{user.name}</p>
              <p className="text-[10px] text-gray-400">{user.email}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {user.status || 'ACTIVE'}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 p-2 rounded-xl text-center">
              <p className="text-[10px] font-black text-gray-800">{user.balance.toFixed(2)}</p>
              <p className="text-[8px] text-gray-400 uppercase">Saldo</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-xl text-center">
              <p className="text-[10px] font-black text-gray-800">{user.activePlanId || 'Nenhum'}</p>
              <p className="text-[8px] text-gray-400 uppercase">Plano</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-xl text-center">
              <p className="text-[10px] font-black text-gray-800">{(user.totalInvested || 0).toFixed(0)}</p>
              <p className="text-[8px] text-gray-400 uppercase">Inv.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => onUpdateStatus(user.id, user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
              className="flex-1 bg-gray-900 text-white text-[9px] font-bold py-2 rounded-lg"
            >
              {user.status === 'ACTIVE' ? 'BLOQUEAR' : 'DESBLOQUEAR'}
            </button>
            <button 
              onClick={() => {
                const amount = prompt('Valor para adicionar/remover (ex: 10 ou -10):');
                if (amount) onAdjustBalance(user.id, parseFloat(amount));
              }}
              className="flex-1 bg-emerald-100 text-emerald-700 text-[9px] font-bold py-2 rounded-lg"
            >
              AJUSTAR SALDO
            </button>
            <button 
               onClick={() => {
                 const plan = prompt('ID do Plano (vip1, vip2, vip3, vip4):');
                 if (plan) onGivePlan(user.id, plan);
               }}
               className="flex-1 bg-blue-100 text-blue-700 text-[9px] font-bold py-2 rounded-lg"
            >
              DAR PLANO
            </button>
            <button 
              onClick={() => confirm('Excluir usuário permanentemente?') && onDeleteUser(user.id)}
              className="bg-red-100 text-red-600 p-2 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <section>
        <h3 className="text-sm font-black text-gray-400 uppercase mb-3 px-1">Depósitos (Aprovações)</h3>
        <div className="space-y-3">
          {deposits.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum pedido de depósito</p>}
          {deposits.map(req => (
            <div key={req.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{req.userName}</p>
                  <p className="text-[10px] text-emerald-600 font-black">{req.amount} USDT {req.planId ? `(${req.planId})` : ''}</p>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {req.status}
                </span>
              </div>
              <p className="text-[8px] font-mono text-gray-400 break-all mb-3 bg-gray-50 p-2 rounded-lg">Hash: {req.hash}</p>
              {req.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-xl">APROVAR</button>
                  <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2 rounded-xl">REJEITAR</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-black text-gray-400 uppercase mb-3 px-1">Saques (Pagamentos)</h3>
        <div className="space-y-3">
          {withdrawals.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum pedido de saque</p>}
          {withdrawals.map(req => (
            <div key={req.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{req.userName}</p>
                  <p className="text-[10px] text-red-600 font-black">{req.amount} USDT (Taxa: {req.fee})</p>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {req.status}
                </span>
              </div>
              <p className="text-[8px] font-mono text-gray-400 break-all mb-3 bg-gray-50 p-2 rounded-lg">Carteira: {req.wallet}</p>
              {req.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-xl">MARCAR COMO PAGO</button>
                  <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2 rounded-xl">RECUSAR</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderPlans = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Gestão de Planos</h3>
        <button className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">+ NOVO</button>
      </div>
      
      {PLANS.map(plan => (
        <div key={plan.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{plan.name}</p>
            <p className="text-[10px] text-gray-400">{plan.dailyPercent}% / Dia • {plan.investment} USDT</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-black text-gray-900 italic">ADMIN PANEL</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network Global Control</p>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-xl text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar bg-white border-b border-gray-100 sticky top-[73px] z-10">
        {[
          { id: 'DASH', label: 'Resumo', icon: '📊' },
          { id: 'USERS', label: 'Usuários', icon: '👥' },
          { id: 'FINANCE', label: 'Financeiro', icon: '💰' },
          { id: 'PLANS', label: 'Planos', icon: '💼' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-gray-50 text-gray-400'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 pb-24">
        {activeTab === 'DASH' && renderDashboard()}
        {activeTab === 'USERS' && renderUsers()}
        {activeTab === 'FINANCE' && renderFinance()}
        {activeTab === 'PLANS' && renderPlans()}
      </div>
    </div>
  );
};

export default AdminPanel;
