
import React, { useState } from 'react';
import { User, DepositRequest, WithdrawRequest, AppView } from '../../types';
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
  const [activeTab, setActiveTab] = useState<'DASH' | 'USERS' | 'PLANS' | 'FINANCE' | 'CONFIG'>('DASH');
  const [financeSubTab, setFinanceSubTab] = useState<'DEPOSITS' | 'WITHDRAWS'>('DEPOSITS');
  const [searchTerm, setSearchTerm] = useState('');

  // 📊 CÁLCULOS DO DASHBOARD
  const totalUsers = users.length;
  const activeUsersCount = users.filter(u => u.status === 'ACTIVE').length;
  const totalInvested = deposits.filter(d => d.status === 'APPROVED').reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);
  const platformBalance = totalInvested - totalPaid;

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9] pb-10">
      {/* HEADER MASTER */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black">NI</div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tighter italic">ADMIN CENTER</h2>
            <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Network Invest v3.1</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* MENU DE NAVEGAÇÃO LATERAL (SIMULADO POR TABS) */}
      <div className="flex bg-white border-b border-slate-200 overflow-x-auto no-scrollbar sticky top-[80px] z-40">
        {[
          { id: 'DASH', label: 'Dashboard', icon: '📊' },
          { id: 'USERS', label: 'Usuários', icon: '👤' },
          { id: 'PLANS', label: 'Planos', icon: '💼' },
          { id: 'FINANCE', label: 'Financeiro', icon: '💰' },
          { id: 'CONFIG', label: 'Ajustes', icon: '⚙️' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 flex flex-col items-center py-4 px-2 min-w-[80px] transition-all border-b-4 ${
              activeTab === tab.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent text-slate-400'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-6">
        {/* 📊 TELA PRINCIPAL: DASHBOARD */}
        {activeTab === 'DASH' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-2xl font-black text-slate-800">{totalUsers}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Usuários</p>
                <p className="text-[8px] text-emerald-500 font-bold mt-2">● {activeUsersCount} Ativos</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-2xl font-black text-emerald-600">{platformBalance.toFixed(0)}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Saldo Plataforma</p>
                <p className="text-[8px] text-slate-300 font-bold mt-2">USDT Disponível</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Resumo Financeiro</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Total Investido</p>
                  <p className="text-xl font-black text-slate-800 tracking-tighter">{totalInvested.toLocaleString()} <span className="text-[10px]">USDT</span></p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Total Pago</p>
                  <p className="text-xl font-black text-red-500 tracking-tighter">{totalPaid.toLocaleString()} <span className="text-[10px]">USDT</span></p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Lucro Estimado</p>
                  <p className="text-xl font-black text-emerald-600 tracking-tighter">{(totalInvested * 0.1).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Taxas Acumuladas</p>
                  <p className="text-xl font-black text-amber-500 tracking-tighter">{(totalPaid * 0.05).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 👤 GESTÃO DE USUÁRIOS (CRM) */}
        {activeTab === 'USERS' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar por Nome, E-mail ou ID..." 
                className="w-full px-6 py-5 rounded-[28px] border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="space-y-3">
              {filteredUsers.map(u => (
                <div key={u.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-slate-50">
                    <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-white ${u.status === 'ACTIVE' ? 'bg-emerald-500 shadow-emerald-100 shadow-lg' : 'bg-red-500'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-slate-800 text-sm uppercase italic tracking-tighter">{u.name}</p>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {u.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold">{u.email}</p>
                      <p className="text-[7px] text-slate-300 font-mono mt-0.5">ID: {u.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-3 rounded-2xl">
                    <div className="text-center">
                      <p className="text-[7px] font-black text-slate-300 uppercase">Saldo</p>
                      <p className="text-xs font-black text-emerald-600">{u.balance.toFixed(2)}</p>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <p className="text-[7px] font-black text-slate-300 uppercase">Investido</p>
                      <p className="text-xs font-black text-slate-800">{u.totalInvested.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[7px] font-black text-slate-300 uppercase">Sacado</p>
                      <p className="text-xs font-black text-red-400">{u.totalWithdrawn.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { const val = prompt('Ajuste de Saldo (+/-):'); if(val) onAdjustBalance(u.id, parseFloat(val)); }} className="bg-slate-900 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95">Ajustar Saldo</button>
                    <button onClick={() => { const pid = prompt('Planos: vip1, vip2, vip3, vip4'); if(pid) onGivePlan(u.id, pid); }} className="bg-emerald-600 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95">Trocar Plano</button>
                    <button onClick={() => onUpdateStatus(u.id, u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')} className={`text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95 ${u.status === 'ACTIVE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.status === 'ACTIVE' ? 'Bloquear' : 'Ativar'}
                    </button>
                    <button onClick={() => alert('Histórico do Usuário:\nAtivações: 2\nSaques: 1\nCheck-ins: 12')} className="bg-slate-100 text-slate-500 text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95">Histórico</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 💼 GESTÃO DE PLANOS */}
        {activeTab === 'PLANS' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            <button className="w-full bg-slate-900 text-white p-6 rounded-[35px] text-center shadow-xl mb-4 active:scale-95 transition-all">
              <span className="text-xl mr-2">➕</span>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Criar Novo Plano</span>
            </button>

            {PLANS.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">{plan.name}</h4>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase">Investimento: {plan.investment} USDT</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-1 rounded-lg uppercase">Ativo</div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="text-center bg-slate-50 p-2 rounded-xl">
                    <p className="text-[7px] font-black text-slate-300 uppercase">% Dia</p>
                    <p className="text-[10px] font-bold text-slate-700">{plan.dailyPercent}%</p>
                  </div>
                  <div className="text-center bg-slate-50 p-2 rounded-xl">
                    <p className="text-[7px] font-black text-slate-300 uppercase">Prazo</p>
                    <p className="text-[10px] font-bold text-slate-700">{plan.durationDays} D</p>
                  </div>
                  <div className="text-center bg-slate-50 p-2 rounded-xl">
                    <p className="text-[7px] font-black text-slate-300 uppercase">Limite</p>
                    <p className="text-[10px] font-bold text-slate-700">1k USDT</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-100 text-slate-600 text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95">Editar</button>
                  <button className="flex-1 bg-red-50 text-red-500 text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95">Desativar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 💰 FINANCEIRO (DEPÓSITOS E SAQUES) */}
        {activeTab === 'FINANCE' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex p-1.5 bg-slate-200/50 rounded-2xl">
               <button onClick={() => setFinanceSubTab('DEPOSITS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'DEPOSITS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Depósitos</button>
               <button onClick={() => setFinanceSubTab('WITHDRAWS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'WITHDRAWS' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}>Saques</button>
            </div>

            {financeSubTab === 'DEPOSITS' ? (
              <div className="space-y-3">
                {deposits.map(req => (
                  <div key={req.id} className={`bg-white p-5 rounded-[30px] border shadow-sm ${req.status === 'PENDING' ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-slate-100 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase leading-none mb-1">{req.userName}</p>
                        <p className="text-[8px] text-slate-300 font-bold">{new Date(req.timestamp).toLocaleDateString()} {new Date(req.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <p className="text-lg font-black text-emerald-600">{req.amount.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                      <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Hash BEP20</p>
                      <p className="text-[9px] font-mono text-slate-400 break-all leading-tight">{req.hash}</p>
                    </div>
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[9px] font-black py-4 rounded-2xl shadow-lg shadow-emerald-50 uppercase tracking-widest">Aprovar</button>
                        <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black py-4 rounded-2xl uppercase tracking-widest">Recusar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map(req => (
                  <div key={req.id} className={`bg-white p-5 rounded-[30px] border shadow-sm ${req.status === 'PENDING' ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-100 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase leading-none mb-1">{req.userName}</p>
                        <p className="text-[8px] text-slate-300 font-bold">{new Date(req.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-amber-600">{req.amount.toFixed(2)}</p>
                        <p className="text-[7px] text-slate-300 font-bold uppercase">Taxa: {req.fee.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl mb-4 border border-white/5">
                      <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Carteira Destino</p>
                      <p className="text-[9px] font-mono text-white break-all">{req.wallet}</p>
                    </div>
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-slate-900 text-white text-[9px] font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest">Pagar Agora</button>
                        <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black py-4 rounded-2xl uppercase tracking-widest">Recusar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ⚙️ AJUSTES DO SISTEMA */}
        {activeTab === 'CONFIG' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Configurações Globais</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-emerald-600 uppercase mb-1 block">Carteira USDT BEP20 Recebedora</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={depositWallet}
                    onChange={(e) => onUpdateWallet(e.target.value)}
                  />
                </div>
                <button onClick={() => alert('Configurações Salvas!')} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-50 active:scale-95 transition-all">Salvar Alterações</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
