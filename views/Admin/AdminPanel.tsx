
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

  // Métricas Calculadas
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const totalInvested = deposits.filter(d => d.status === 'APPROVED').reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);
  const platformBalance = totalInvested - totalPaid;
  
  const pendingDeps = deposits.filter(d => d.status === 'PENDING');
  const pendingWiths = withdrawals.filter(w => w.status === 'PENDING');

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20">
      {/* Header Superior */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">NETWORK ADMIN</h2>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Sistema Online v3.1</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Menu de Navegação Horizontal */}
      <div className="flex p-4 gap-2 bg-white border-b border-slate-100 sticky top-[81px] z-40 overflow-x-auto no-scrollbar shadow-sm">
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
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'FINANCE' && (pendingDeps.length + pendingWiths.length) > 0 && (
              <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                {pendingDeps.length + pendingWiths.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-6">
        {/* VIEW: DASHBOARD */}
        {activeTab === 'DASH' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Grid de Métricas Principais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                <p className="text-3xl font-black text-slate-900 mb-1">{users.length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Usuários</p>
                <p className="text-[8px] text-emerald-500 font-bold mt-2">● {activeUsers} Ativos</p>
              </div>
              <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                <p className="text-2xl font-black text-emerald-600 mb-1">{totalInvested.toFixed(0)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Investido</p>
                <p className="text-[8px] text-slate-300 font-bold mt-2">USDT Acumulado</p>
              </div>
            </div>

            {/* Card de Lucro da Plataforma */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
               <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-1">Lucro Líquido Sistema</p>
               <h3 className="text-4xl font-black tracking-tighter italic">
                 {platformBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm opacity-30">USDT</span>
               </h3>
               
               <div className="mt-8 grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-[9px] font-black opacity-40 uppercase mb-1">Total Pagos</p>
                    <p className="text-lg font-bold text-red-400">{totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black opacity-40 uppercase mb-1">Retenção</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {totalInvested > 0 ? ((platformBalance / totalInvested) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
               </div>
            </div>

            {/* Listagem Rápida de Atividades */}
            <div className="space-y-3">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ações Pendentes Urgentes</h4>
               {pendingDeps.length === 0 && pendingWiths.length === 0 && (
                 <div className="bg-emerald-50 p-6 rounded-[30px] border border-emerald-100 text-center">
                   <p className="text-[10px] font-black text-emerald-600 uppercase">Tudo em dia! Sem pendências.</p>
                 </div>
               )}
               {pendingDeps.slice(0, 2).map(d => (
                 <div key={d.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">📥</div>
                     <div>
                       <p className="text-[10px] font-black text-slate-800 uppercase">{d.userName}</p>
                       <p className="text-[8px] text-emerald-500 font-bold uppercase">Depósito: {d.amount} USDT</p>
                     </div>
                   </div>
                   <button onClick={() => setActiveTab('FINANCE')} className="bg-slate-900 text-white text-[8px] font-black px-4 py-2 rounded-lg uppercase">Resolver</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* VIEW: USUÁRIOS (CRM) */}
        {activeTab === 'USERS' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Nome, e-mail ou ID do usuário..." 
                className="w-full px-6 py-5 rounded-[28px] border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <svg className="w-5 h-5 absolute right-6 top-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="space-y-3">
              {filteredUsers.map(u => (
                <div key={u.id} className="bg-white p-5 rounded-[35px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-white text-lg ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm italic tracking-tighter uppercase">{u.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{u.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full font-black text-slate-500 uppercase">{u.activePlanId || 'VIP 0'}</span>
                          <span className="text-[8px] font-black text-slate-300 uppercase">Desde {new Date(u.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-600 tracking-tighter">{u.balance.toFixed(2)}</p>
                      <p className="text-[8px] text-slate-300 font-black uppercase">Saldo USDT</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { const val = prompt('Ajuste de Saldo (ex: 50 para adicionar, -50 para remover):'); if(val) onAdjustBalance(u.id, parseFloat(val)); }}
                      className="bg-slate-50 text-slate-900 text-[9px] font-black py-4 rounded-2xl uppercase tracking-widest border border-slate-100 active:scale-95"
                    >
                      Ajustar Saldo
                    </button>
                    <button 
                      onClick={() => { const pid = prompt('Novo Plano (vip1, vip2, vip3, vip4):'); if(pid) onGivePlan(u.id, pid); }}
                      className="bg-emerald-50 text-emerald-700 text-[9px] font-black py-4 rounded-2xl uppercase tracking-widest border border-emerald-100 active:scale-95"
                    >
                      Trocar Plano
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(u.id, u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
                      className={`text-[9px] font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 ${u.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-900 text-white'}`}
                    >
                      {u.status === 'ACTIVE' ? 'Bloquear Acesso' : 'Desbloquear'}
                    </button>
                    <button 
                      onClick={() => onDeleteUser(u.id)}
                      className="bg-red-50 text-red-600 text-[9px] font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95"
                    >
                      Excluir Conta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: GESTÃO DE PLANOS */}
        {activeTab === 'PLANS' && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-900 p-8 rounded-[40px] text-white text-center">
               <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Editor de Planos</h3>
               <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Configure os rendimentos da plataforma</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {PLANS.map(plan => (
                <div key={plan.id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                      {plan.id === 'vip4' ? '👑' : '💎'}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-tight">{plan.name}</h4>
                      <p className="text-[9px] text-emerald-500 font-bold uppercase">Investimento: {plan.investment} USDT</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Rendimento: {plan.dailyReturn} USDT/Dia</p>
                    </div>
                  </div>
                  <button className="bg-slate-100 text-slate-400 p-3 rounded-xl active:scale-90" onClick={() => alert('Função em desenvolvimento para a próxima atualização!')}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: FINANCEIRO (DEPÓSITOS E SAQUES) */}
        {activeTab === 'FINANCE' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Sub-menu Financeiro */}
            <div className="flex p-1 bg-slate-100 rounded-2xl">
               <button 
                 onClick={() => setFinanceSubTab('DEPOSITS')}
                 className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'DEPOSITS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
               >
                 Entradas (Depósitos)
               </button>
               <button 
                 onClick={() => setFinanceSubTab('WITHDRAWS')}
                 className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'WITHDRAWS' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}
               >
                 Saídas (Saques)
               </button>
            </div>

            {financeSubTab === 'DEPOSITS' ? (
              <div className="space-y-4">
                {deposits.length === 0 ? (
                  <div className="p-12 text-center text-slate-300">Nenhum registro de depósito</div>
                ) : (
                  deposits.map(req => (
                    <div key={req.id} className={`bg-white p-6 rounded-[35px] border shadow-sm ${req.status === 'PENDING' ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-slate-100'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase leading-none mb-1">{req.userName}</p>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-emerald-600 leading-none">{req.amount.toFixed(2)}</p>
                          <p className="text-[8px] text-slate-300 font-black uppercase">USDT</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl mb-5">
                        <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Comprovante / Hash</p>
                        <p className="text-[10px] font-mono text-slate-500 break-all leading-relaxed">{req.hash}</p>
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-black py-4 rounded-2xl shadow-lg shadow-emerald-50 uppercase tracking-widest">Aprovar Ativação</button>
                          <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest">Recusar</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.length === 0 ? (
                  <div className="p-12 text-center text-slate-300">Nenhum registro de saque</div>
                ) : (
                  withdrawals.map(req => (
                    <div key={req.id} className={`bg-white p-6 rounded-[35px] border shadow-sm ${req.status === 'PENDING' ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-100'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase leading-none mb-1">{req.userName}</p>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-amber-600 leading-none">{req.amount.toFixed(2)}</p>
                          <p className="text-[8px] text-slate-300 font-black uppercase">USDT (Liq.)</p>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-2xl mb-5 border border-white/5">
                        <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Carteira Destino BEP20</p>
                        <p className="text-[10px] font-mono text-white break-all">{req.wallet}</p>
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-slate-900 text-white text-[10px] font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest">Confirmar Pagamento</button>
                          <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest">Recusar</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CONFIGURAÇÕES DO SISTEMA */}
        {activeTab === 'CONFIG' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">⚙️</div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ajustes da Plataforma</h3>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-emerald-600 uppercase px-1">Carteira Coletora USDT (BSC)</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={depositWallet}
                    onChange={(e) => onUpdateWallet(e.target.value)}
                  />
                  <p className="text-[8px] text-slate-400 font-bold uppercase px-1">Este endereço será exibido para todos os depósitos.</p>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                   <button onClick={() => alert('Sistema de Manutenção Ativado')} className="bg-amber-50 text-amber-700 text-[9px] font-black py-4 rounded-2xl uppercase border border-amber-100">Modo Manutenção</button>
                   <button onClick={() => alert('Configurações Salvas')} className="bg-emerald-600 text-white text-[9px] font-black py-4 rounded-2xl uppercase shadow-lg shadow-emerald-50">Salvar Mudanças</button>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-8 rounded-[35px] text-center border border-slate-200">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Network Invest v3.1 Gold Edition</p>
               <p className="text-[8px] text-slate-300 font-bold uppercase mt-2">© 2024 Todos os Direitos Reservados</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
