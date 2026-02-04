
import React, { useState, useEffect } from 'react';
import { User, DepositRequest, WithdrawRequest } from '../../types';
import { PLANS, APP_CONFIG } from '../../constants';
import { supabase } from '../../supabase';

interface AdminPanelProps {
  users: User[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  depositWallet: string;
  onUpdateWallet: (w: string) => void;
  onClose: () => void;
  currency: 'BRL' | 'USDT';
  onToggleCurrency: () => void;
  onApproveDeposit: (id: string) => void;
  onRejectDeposit: (id: string) => void;
  onApproveWithdraw: (id: string) => void;
  onRejectWithdraw: (id: string) => void;
  onUpdateStatus: (userId: string, status: 'ACTIVE' | 'BLOCKED') => void;
  onDeleteUser: (userId: string) => void;
  onGivePlan: (userId: string, planId: string) => void;
  onAdjustBalance: (userId: string, amount: number) => void;
  onUpdateReferrer?: (userId: string, newReferrerCode: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, deposits, withdrawals, depositWallet, onUpdateWallet, onClose, 
  currency, onToggleCurrency,
  onApproveDeposit, onRejectDeposit, onApproveWithdraw, onRejectWithdraw,
  onUpdateStatus, onDeleteUser, onGivePlan, onAdjustBalance, onUpdateReferrer
}) => {
  const [activeTab, setActiveTab] = useState<'DASH' | 'USERS' | 'FINANCE' | 'CONFIG' | 'SECURITY'>('DASH');
  const [financeSubTab, setFinanceSubTab] = useState<'DEPOSITS' | 'WITHDRAWS'>('DEPOSITS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserNetwork, setSelectedUserNetwork] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatValue = (val: number) => {
    if (currency === 'BRL') {
      const brlValue = val * APP_CONFIG.USDT_BRL_RATE;
      return brlValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return `${val.toFixed(2)} USDT`;
  };

  const fetchUserNetwork = async (user: User) => {
    setSelectedUserNetwork(user.id);
    setNetworkData({ loading: true });
    
    try {
      const { data: level1 } = await supabase.from('profiles').select('name, referral_code').eq('referred_by', user.referralCode);
      setNetworkData({
        loading: false,
        level1: level1 || [],
        referrer: user.referredBy
      });
    } catch (e) {
      setNetworkData({ loading: false, error: true });
    }
  };

  const handleUpdateOwnPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    setIsUpdatingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      alert("Erro ao atualizar senha: " + error.message);
    } else {
      alert("Sua senha de Administrador foi alterada com sucesso!");
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsUpdatingPass(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-900">NI</div>
          <h2 className="text-sm font-black uppercase tracking-tighter italic text-emerald-400">ADMIN CENTER</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleCurrency}
            className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 flex items-center space-x-2 active:scale-95 transition-all"
          >
            <span className={`text-[9px] font-black ${currency === 'BRL' ? 'text-emerald-400' : 'text-slate-400'}`}>BRL</span>
            <div className="w-6 h-3 bg-white/5 rounded-full relative p-0.5">
              <div className={`w-2 h-2 bg-emerald-500 rounded-full transition-all duration-300 ${currency === 'USDT' ? 'translate-x-3' : 'translate-x-0'}`}></div>
            </div>
            <span className={`text-[9px] font-black ${currency === 'USDT' ? 'text-emerald-400' : 'text-slate-400'}`}>USDT</span>
          </button>
          
          <button onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex bg-white border-b overflow-x-auto no-scrollbar">
        {[
          { id: 'DASH', label: 'Dashboard', icon: '📊' },
          { id: 'USERS', label: 'Usuários', icon: '👤' },
          { id: 'FINANCE', label: 'Financeiro', icon: '💰' },
          { id: 'SECURITY', label: 'Segurança', icon: '🔐' },
          { id: 'CONFIG', label: 'Ajustes', icon: '⚙️' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 flex flex-col items-center py-4 px-2 min-w-[80px] border-b-4 transition-all ${
              activeTab === tab.id ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-transparent text-slate-400'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 flex-1">
        {activeTab === 'USERS' && (
          <div className="space-y-3">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nome, Email ou Código Ref..." 
                  className="w-full p-5 rounded-[25px] bg-white border-2 border-slate-100 text-sm font-bold outline-none focus:border-emerald-500 transition-all shadow-sm" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
             </div>

             {filteredUsers.map(u => (
               <div key={u.id} className="bg-white p-6 rounded-[35px] border-2 border-slate-50 shadow-sm space-y-4 hover:border-emerald-100 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-tighter italic text-lg">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p>
                      <p className="text-[9px] text-emerald-600 font-black mt-1">REF: {u.referralCode} | INDICADO POR: {u.referredBy}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{u.status}</span>
                      <button 
                        onClick={() => { if(confirm('Excluir usuário PERMANENTEMENTE?')) onDeleteUser(u.id); }}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Atual ({currency})</p>
                      <p className="text-sm font-black text-emerald-600 italic">{formatValue(u.balance)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Plano Ativo</p>
                      <p className="text-sm font-black text-slate-800 uppercase italic">{u.activePlanId || 'Nenhum'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { const val = prompt(`Valor em USDT para adicionar ou subtrair (+10 ou -10):`); if(val) onAdjustBalance(u.id, parseFloat(val)); }} className="flex-1 bg-slate-900 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95 transition-all">💸 Ajustar Saldo</button>
                    <button onClick={() => { const pid = prompt('ID do Plano (vip1, vip2, vip3, vip4):'); if(pid) onGivePlan(u.id, pid); }} className="flex-1 bg-emerald-600 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95 transition-all">💎 Dar VIP</button>
                    <button onClick={() => onUpdateStatus(u.id, u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')} className="flex-1 bg-amber-500 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest active:scale-95 transition-all">🚫 Bloquear</button>
                    <button onClick={() => fetchUserNetwork(u)} className="flex-1 bg-blue-600 text-white text-[9px] font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-all w-full">🕸️ Ver Rede & Ligar</button>
                  </div>

                  {selectedUserNetwork === u.id && networkData && (
                    <div className="mt-4 p-5 bg-blue-50 rounded-[25px] border border-blue-100 space-y-4 animate-in slide-in-from-top duration-300">
                       <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                          <h4 className="text-[10px] font-black text-blue-800 uppercase">Gestão de Rede</h4>
                          <button onClick={() => setSelectedUserNetwork(null)} className="text-blue-400 font-black text-xs">FECHAR</button>
                       </div>
                       
                       <div>
                          <p className="text-[9px] font-black text-blue-500 uppercase mb-2">Padrinho (Indicador Atual):</p>
                          <div className="flex gap-2">
                             <input 
                               type="text" 
                               defaultValue={u.referredBy} 
                               className="flex-1 p-3 rounded-xl bg-white border border-blue-200 text-xs font-black"
                               id={`ref-input-${u.id}`}
                             />
                             <button 
                               onClick={() => {
                                 const input = document.getElementById(`ref-input-${u.id}`) as HTMLInputElement;
                                 if(input && onUpdateReferrer) onUpdateReferrer(u.id, input.value);
                               }}
                               className="bg-blue-600 text-white text-[9px] font-black px-4 rounded-xl uppercase"
                             >
                               Salvar
                             </button>
                          </div>
                       </div>

                       <div>
                          <p className="text-[9px] font-black text-blue-500 uppercase mb-2">Indicados Diretos (Nível 1):</p>
                          {networkData.loading ? <p className="text-[9px] italic">Carregando...</p> : (
                            <div className="space-y-1">
                              {networkData.level1.length === 0 ? <p className="text-[9px] text-blue-300 italic">Nenhum indicado direto.</p> : networkData.level1.map((sub: any, i: number) => (
                                <div key={i} className="bg-white/50 p-2 rounded-lg text-[9px] font-bold text-blue-900 border border-white flex justify-between">
                                  <span>{sub.name}</span>
                                  <span className="opacity-50">REF: {sub.referral_code}</span>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                    </div>
                  )}
               </div>
             ))}
          </div>
        )}

        {activeTab === 'SECURITY' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl">🔐</div>
                <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">Trocar Minha Senha</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Atualize sua senha de administrador</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Nova Senha</label>
                  <input 
                    type="password" 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none focus:border-emerald-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none focus:border-emerald-500 transition-all"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={handleUpdateOwnPassword}
                  disabled={isUpdatingPass}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingPass ? 'PROCESSANDO...' : 'ATUALIZAR MINHA SENHA'}
                </button>

                <p className="text-[8px] text-center text-slate-400 font-bold uppercase leading-relaxed mt-4">
                  * Como o e-mail master@networkinvest.com é fictício, esta é a única forma de recuperar seu acesso caso esqueça a senha.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FINANCE' && (
          <div className="space-y-6">
            <div className="flex p-1 bg-slate-200 rounded-2xl">
               <button onClick={() => setFinanceSubTab('DEPOSITS')} className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'DEPOSITS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Depósitos</button>
               <button onClick={() => setFinanceSubTab('WITHDRAWS')} className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${financeSubTab === 'WITHDRAWS' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}>Saques</button>
            </div>

            {financeSubTab === 'DEPOSITS' ? (
              <div className="space-y-4">
                {deposits.length === 0 ? (
                   <div className="text-center py-20">
                     <div className="text-4xl mb-4 opacity-20">📥</div>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Nenhum depósito pendente</p>
                   </div>
                ) : (
                  deposits.map(req => (
                    <div key={req.id} className={`bg-white p-6 rounded-[35px] border-2 shadow-sm transition-all ${req.status === 'PENDING' ? 'border-emerald-200' : 'opacity-60 border-slate-50'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter mb-1">{req.userName}</p>
                          <p className="text-[8px] text-slate-400 font-bold">{new Date(req.timestamp).toLocaleString()}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-[7px] font-black uppercase px-3 py-1 rounded-full ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{req.status}</span>
                            <span className={`text-[7px] font-black uppercase px-3 py-1 rounded-full ${req.method === 'PIX' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {req.method}
                            </span>
                          </div>
                        </div>
                        <p className="text-xl font-black text-emerald-600 italic tracking-tighter">{formatValue(req.amount)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl mb-5 text-[9px] font-mono break-all leading-relaxed border border-slate-100 select-all">
                        <span className="text-slate-400 block mb-1 uppercase font-bold text-[8px]">{req.method === 'PIX' ? 'Comprovante:' : 'Hash Transação:'}</span>
                        {req.hash || 'Sem hash informada'}
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-3">
                          <button onClick={() => onApproveDeposit(req.id)} className="flex-1 bg-emerald-600 text-white text-[9px] font-black py-5 rounded-2xl uppercase tracking-widest shadow-lg shadow-emerald-50 active:scale-95 transition-all">✅ Aprovar</button>
                          <button onClick={() => onRejectDeposit(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black py-5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">❌ Recusar</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-4xl mb-4 opacity-20">📤</div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Sem solicitações de saque</p>
                  </div>
                ) : (
                  withdrawals.map(req => (
                    <div key={req.id} className={`bg-white p-6 rounded-[35px] border-2 shadow-sm transition-all ${req.status === 'PENDING' ? 'border-amber-200' : 'opacity-60 border-slate-50'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter mb-1">{req.userName}</p>
                          <p className="text-[8px] text-slate-400 font-bold">{new Date(req.timestamp).toLocaleString()}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-[7px] font-black uppercase px-3 py-1 rounded-full ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{req.status}</span>
                            <span className={`text-[7px] font-black uppercase px-3 py-1 rounded-full ${req.method === 'PIX' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {req.method}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-amber-600 italic tracking-tighter">{formatValue(req.amount - req.fee)}</p>
                          <p className="text-[7px] text-slate-300 font-black uppercase tracking-widest">Taxa: {formatValue(req.fee)} | Bruto: {formatValue(req.amount)}</p>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-2xl mb-5 text-emerald-400 text-[9px] font-mono break-all leading-relaxed shadow-inner select-all">
                        <span className="text-white/30 block mb-1 uppercase font-bold text-[8px]">{req.method === 'PIX' ? 'Chave PIX:' : 'Endereço Carteira:'}</span>
                        {req.wallet}
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-3">
                          <button onClick={() => onApproveWithdraw(req.id)} className="flex-1 bg-slate-900 text-white text-[9px] font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all border border-emerald-500/20">💸 Pagar</button>
                          <button onClick={() => onRejectWithdraw(req.id)} className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black py-5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">❌ Recusar</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'DASH' && (
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[35px] border-2 border-slate-50 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-3">👤</div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Usuários</p>
                <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{users.length}</p>
             </div>
             <div className="bg-white p-6 rounded-[35px] border-2 border-slate-50 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-3">📤</div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saques Pend.</p>
                <p className="text-3xl font-black text-amber-500 italic tracking-tighter">{withdrawals.filter(w => w.status === 'PENDING').length}</p>
             </div>
             <div className="bg-white p-6 rounded-[35px] border-2 border-slate-50 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-3">📥</div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deps. Pend.</p>
                <p className="text-3xl font-black text-emerald-600 italic tracking-tighter">{deposits.filter(d => d.status === 'PENDING').length}</p>
             </div>
             <div className="bg-slate-900 p-6 rounded-[35px] border shadow-xl flex flex-col items-center text-center text-white">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white mb-3">💰</div>
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Saldo Total ({currency})</p>
                <p className={`font-black italic tracking-tighter text-emerald-400 ${currency === 'BRL' ? 'text-lg' : 'text-xl'}`}>
                  {formatValue(users.reduce((acc, u) => acc + u.balance, 0))}
                </p>
             </div>
          </div>
        )}

        {activeTab === 'CONFIG' && (
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center">
                   <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3 text-sm">🌐</span>
                   Carteira de Recebimento
                </h3>
                <div className="space-y-4">
                   <input 
                     type="text" 
                     className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-mono text-[10px] focus:border-emerald-500 outline-none transition-all shadow-inner"
                     value={depositWallet}
                     onChange={(e) => onUpdateWallet(e.target.value)}
                   />
                   <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Salvar Endereço Global</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
