
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
  const [searchTerm, setSearchTerm] = useState('');

  // Stats calculation
  const totalInvested = users.reduce((sum, u) => sum + (u.totalInvested || 0), 0);
  const totalPaid = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);
  const platformProfit = totalInvested - totalPaid;
  const activeVips = users.filter(u => u.activePlanId && u.activePlanId !== 'vip0').length;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanName = (planId: string | undefined) => {
    if (!planId) return 'Nenhum';
    const plan = PLANS.find(p => p.id === planId);
    return plan ? plan.name : 'VIP 0';
  };

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

      <div className="bg-emerald-950 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Lucro da Plataforma</p>
          <span className="bg-emerald-500/20 text-emerald-300 text-[8px] px-2 py-0.5 rounded-full font-black border border-emerald-500/30 uppercase tracking-widest">Global Control</span>
        </div>
        <h3 className="text-4xl font-black">{platformProfit.toFixed(2)} <span className="text-lg font-medium opacity-50">USDT</span></h3>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Gestão de Usuários</h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 uppercase text-xs">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-[10px] text-gray-400">{user.email}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {user.status || 'ACTIVE'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 p-2 rounded-xl text-center">
                <p className="text-[10px] font-black text-gray-800">{user.balance.toFixed(2)}</p>
                <p className="text-[8px] text-gray-400 uppercase">Saldo</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-xl text-center">
                <p className="text-[10px] font-black text-emerald-600">{getPlanName(user.activePlanId)}</p>
                <p className="text-[8px] text-gray-400 uppercase">Plano</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-xl text-center">
                <p className="text-[10px] font-black text-gray-800">{(user.totalInvested || 0).toFixed(0)}</p>
                <p className="text-[8px] text-gray-400 uppercase">Inv.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => onUpdateStatus(user.id, user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')} className="flex-1 bg-gray-900 text-white text-[9px] font-bold py-2 rounded-lg">BLOQUEAR</button>
              <button onClick={() => { const val = prompt('Ajuste de Saldo (ex: 10):'); if(val) onAdjustBalance(user.id, parseFloat(val)); }} className="flex-1 bg-emerald-100 text-emerald-700 text-[9px] font-bold py-2 rounded-lg">AJUSTAR SALDO</button>
              <button onClick={() => { const p = prompt('ID do Plano (vip1, vip2, vip3, vip4):'); if(p) onGivePlan(user.id, p); }} className="flex-1 bg-blue-100 text-blue-700 text-[9px] font-bold py-2 rounded-lg">DAR PLANO</button>
              <button onClick={() => confirm('Excluir usuário?') && onDeleteUser(user.id)} className="bg-red-50 text-red-600 p-2 rounded-lg border border-red-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <section>
        <h3 className="text-sm font-black text-gray-400 uppercase mb-3 px-1">Depósitos Pendentes</h3>
        <div className="space-y-3">
          {deposits.filter(d => d.status === 'PENDING').map(req => (
            <div key={req.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{req.userName}</p>
                  <p className="text-[10px] text-emerald-600 font-black">{req.amount.toFixed(2)} USDT - Alvo: {getPlanName(req.planId)}</p>
                </div>
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PENDENTE</span>
              </div>
              <p className="text-[8px] font-mono text-gray-400 break-all mb-3 bg-gray-50 p-2 rounded-lg italic">Hash: {req.hash}</p>
              <div className="flex gap-2">
                <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2.5 rounded-xl shadow-lg active:scale-95 transition-all uppercase">APROVAR PLANO</button>
                <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2.5 rounded-xl uppercase">RECUSAR</button>
              </div>
            </div>
          ))}
          {deposits.filter(d => d.status === 'PENDING').length === 0 && <p className="text-center text-gray-400 text-xs py-8 bg-white rounded-2xl border border-dashed border-gray-200">Sem depósitos para análise.</p>}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-black text-gray-400 uppercase mb-3 px-1">Saques Pendentes</h3>
        <div className="space-y-3">
          {withdrawals.filter(w => w.status === 'PENDING').map(req => (
            <div key={req.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{req.userName}</p>
                  <p className="text-[10px] text-red-600 font-black">{req.amount.toFixed(2)} USDT</p>
                </div>
              </div>
              <p className="text-[8px] font-mono text-gray-400 break-all mb-3 bg-gray-50 p-2 rounded-lg">Carteira: {req.wallet}</p>
              <div className="flex gap-2">
                <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2.5 rounded-xl shadow-lg active:scale-95 transition-all">PAGO</button>
                <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-bold py-2.5 rounded-xl">RECUSAR</button>
              </div>
            </div>
          ))}
          {withdrawals.filter(w => w.status === 'PENDING').length === 0 && <p className="text-center text-gray-400 text-xs py-8 bg-white rounded-2xl border border-dashed border-gray-200">Sem saques pendentes.</p>}
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 italic leading-none">ADMIN PANEL</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Network Global Control</p>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-xl text-gray-400 active:rotate-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar bg-white border-b border-gray-100 sticky top-[73px] z-10">
        {[
          { id: 'DASH', label: 'Resumo', icon: '📊' },
          { id: 'USERS', label: 'Usuários', icon: '👥' },
          { id: 'FINANCE', label: 'Financeiro', icon: '💰' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center space-x-2 border-2 ${
              activeTab === tab.id 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
              : 'bg-white text-gray-400 border-gray-50'
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 pb-24">
        {activeTab === 'DASH' && renderDashboard()}
        {activeTab === 'USERS' && renderUsers()}
        {activeTab === 'FINANCE' && renderFinance()}
      </div>
    </div>
  );
};

export default AdminPanel;
