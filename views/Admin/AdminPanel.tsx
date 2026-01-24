
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
  onUpdateStatus, onDeleteUser, onGivePlan, onAdjustBalance
}) => {
  const [activeTab, setActiveTab] = useState<'DASH' | 'USERS' | 'FINANCE' | 'CONFIG'>('DASH');
  const [searchTerm, setSearchTerm] = useState('');

  // Somas Reais baseadas nos depósitos aprovados no banco
  const totalApprovedDeposits = deposits.filter(d => d.status === 'APPROVED').reduce((sum, d) => sum + d.amount, 0);
  const totalPaidWithdrawals = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);
  const netProfit = totalApprovedDeposits - totalPaidWithdrawals;

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-12">
      <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
        <h2 className="text-xl font-black italic uppercase text-emerald-900">ADMIN PANEL</h2>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-xl text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex p-4 gap-2 bg-white border-b border-gray-100 sticky top-[73px] z-30 overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'DASH', label: 'Resumo' },
          { id: 'USERS', label: `Usuários (${users.length})` },
          { id: 'FINANCE', label: 'Financeiro' },
          { id: 'CONFIG', label: 'Config' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-none px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
              activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'DASH' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <p className="text-3xl font-black text-emerald-600 mb-1">{users.length}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Contas</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <p className="text-2xl font-black text-emerald-600 mb-1">{totalApprovedDeposits.toFixed(0)}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Recebido (USDT)</p>
              </div>
            </div>

            <div className="bg-emerald-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Lucro Líquido Real</p>
                 <h3 className="text-4xl font-black">{netProfit.toFixed(2)} <span className="text-sm opacity-40">USDT</span></h3>
                 <div className="mt-4 flex gap-4 text-[10px] font-bold opacity-60 uppercase">
                    <span>PAGOS: {totalPaidWithdrawals.toFixed(2)}</span>
                    <span>EM CAIXA: {totalApprovedDeposits.toFixed(2)}</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full px-5 py-4 rounded-3xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-gray-900 text-base">{u.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{u.email}</p>
                    <p className="text-[8px] font-mono text-emerald-500 mt-1 break-all bg-emerald-50 p-1 rounded">BEP20: {u.walletAddress || 'Não cadastrada'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">{u.balance.toFixed(2)}</p>
                    <p className="text-[8px] text-gray-400 font-black uppercase">Saldo</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { const val = prompt('Saldo +/-:'); if(val) onAdjustBalance(u.id, parseFloat(val)); }} className="bg-gray-900 text-white text-[9px] font-black py-3 rounded-xl uppercase">Editar Saldo</button>
                  <button onClick={() => { const pid = prompt('Plano (vip1...vip4):'); if(pid) onGivePlan(u.id, pid); }} className="bg-emerald-600 text-white text-[9px] font-black py-3 rounded-xl uppercase">Dar Plano</button>
                  <button onClick={() => onUpdateStatus(u.id, u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')} className={`text-[9px] font-black py-3 rounded-xl uppercase ${u.status === 'ACTIVE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.status === 'ACTIVE' ? 'Bloquear' : 'Ativar'}</button>
                  <button onClick={() => onDeleteUser(u.id)} className="bg-red-50 text-red-600 text-[9px] font-black py-3 rounded-xl uppercase">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'FINANCE' && (
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 px-2 tracking-widest flex items-center">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span> Depósitos Pendentes ({deposits.filter(d => d.status === 'PENDING').length})
              </h3>
              {deposits.filter(d => d.status === 'PENDING').map(req => (
                <div key={req.id} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-black text-gray-900">{req.userName} <span className="text-emerald-500">({req.planId || 'Saldo'})</span></p>
                    <p className="text-lg font-black text-emerald-600">{req.amount} USDT</p>
                  </div>
                  <p className="text-[8px] font-mono text-gray-400 mb-4 bg-gray-50 p-2 rounded-xl break-all">HASH: {req.hash}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-black py-4 rounded-2xl shadow-lg shadow-emerald-50 uppercase">APROVAR</button>
                    <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-black py-4 rounded-2xl uppercase">RECUSAR</button>
                  </div>
                </div>
              ))}
            </section>
            
            <section>
               <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 px-2 tracking-widest flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span> Saques Pendentes ({withdrawals.filter(w => w.status === 'PENDING').length})
              </h3>
              {withdrawals.filter(w => w.status === 'PENDING').map(req => (
                <div key={req.id} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-black text-gray-900">{req.userName}</p>
                    <p className="text-lg font-black text-blue-600">{req.amount} USDT</p>
                  </div>
                  <p className="text-[8px] font-mono text-gray-400 mb-4 bg-gray-50 p-2 rounded-xl break-all uppercase">Wallet: {req.wallet}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-blue-600 text-white text-[10px] font-black py-4 rounded-2xl shadow-lg shadow-blue-50 uppercase">PAGAR</button>
                    <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-black py-4 rounded-2xl uppercase">RECUSAR</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'CONFIG' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Carteira de Depósito (BEP20)</h3>
              <input 
                type="text" 
                className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-mono mb-4"
                value={depositWallet}
                onChange={(e) => onUpdateWallet(e.target.value)}
              />
              <button onClick={() => alert('Carteira salva!')} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase">Salvar Alteração</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
