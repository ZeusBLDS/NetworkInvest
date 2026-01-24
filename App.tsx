
import React, { useState, useEffect } from 'react';
import { AppView, User, Notification, DepositRequest, WithdrawRequest } from './types';
import { PLANS } from './constants';
import { supabase } from './supabase';
import Login from './views/Auth/Login';
import Register from './views/Auth/Register';
import Home from './views/Dashboard/Home';
import PlanList from './views/Plans/PlanList';
import NetworkView from './views/Network/Network';
import Account from './views/Account/Account';
import AdminPanel from './views/Admin/AdminPanel';
import Layout from './components/Layout';
import WelcomeModal from './components/WelcomeModal';
import VipZeroModal from './components/VipZeroModal';
import WithdrawModal from './components/WithdrawModal';
import DepositModal from './components/DepositModal';
import LuckyWheelModal from './components/LuckyWheelModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Platform States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);

  // Modals
  const [showWelcome, setShowWelcome] = useState(false);
  const [showVipZero, setShowVipZero] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentView(AppView.LOGIN);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const user = data as any;
        const normalizedUser: User = {
          id: user.id,
          name: user.name || 'Usuário',
          email: user.email || '',
          phone: user.phone || '',
          cpf: user.cpf || '',
          referralCode: user.referral_code || '',
          referredBy: user.referred_by || 'Não informado',
          balance: parseFloat(user.balance || 0),
          walletAddress: user.wallet_address || '',
          activePlanId: user.active_plan_id || 'vip0',
          joinDate: new Date(user.created_at).getTime(),
          checkInStreak: user.check_in_streak || 0,
          isFirstLogin: user.is_first_login ?? false,
          role: user.role || 'USER',
          status: user.status || 'ACTIVE',
          totalInvested: parseFloat(user.total_invested || 0),
          totalWithdrawn: parseFloat(user.total_withdrawn || 0),
          lastCheckIn: user.last_check_in,
          lastWheelSpin: user.last_wheel_spin
        };

        setCurrentUser(normalizedUser);
        
        if (normalizedUser.isFirstLogin) {
          setShowWelcome(true);
          setShowVipZero(true);
          await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        }

        if (normalizedUser.role === 'ADMIN') fetchAdminData();
        setCurrentView(AppView.HOME);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Erro no Perfil:", err.message);
      
      if (retryCount < 2) {
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 2000);
      } else {
        setAuthError("Erro ao carregar dados. Verifique se as tabelas foram criadas no Supabase.");
        setLoading(false);
      }
    }
  };

  const fetchAdminData = async () => {
    try {
      const [u, d, w] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
      ]);
      if (u.data) setAllUsers(u.data as any);
      if (d.data) setDeposits(d.data.map((req: any) => ({
        id: req.id,
        userId: req.user_id,
        userName: req.user_name,
        amount: parseFloat(req.amount),
        hash: req.hash,
        planId: req.plan_id,
        status: req.status,
        timestamp: new Date(req.created_at).getTime()
      })) as any);
      if (w.data) setWithdrawals(w.data.map((req: any) => ({
        id: req.id,
        userId: req.user_id,
        userName: req.user_name,
        amount: parseFloat(req.amount),
        wallet: req.wallet,
        fee: parseFloat(req.fee),
        status: req.status,
        timestamp: new Date(req.created_at).getTime()
      })) as any);
    } catch (e) {
      console.error("Erro Admin Data:", e);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    const { error } = await supabase.rpc('increment_balance', { user_id: id, amount_to_add: amount });
    if (!error) fetchUserProfile(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-900 text-white p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="font-bold tracking-widest animate-pulse mb-2">NETWORK INVEST</p>
        <p className="text-xs opacity-60">Sincronizando dados...</p>
      </div>
    );
  }

  if (authError && !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">{authError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg"
        >
          TENTAR NOVAMENTE
        </button>
        <button 
          onClick={handleLogout}
          className="mt-4 text-gray-400 font-bold text-xs uppercase"
        >
          VOLTAR PARA LOGIN
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) {
      if (currentView === AppView.REGISTER) return <Register onSwitch={() => setCurrentView(AppView.LOGIN)} onRegister={() => {}} />;
      return <Login onSwitch={() => setCurrentView(AppView.REGISTER)} onLogin={() => {}} />;
    }

    switch (currentView) {
      case AppView.HOME:
        return <Home user={currentUser} updateBalance={updateBalance} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => { setPendingPlanId(null); setShowDeposit(true); }} onOpenWheel={() => setShowWheel(true)} />;
      case AppView.PLANS:
        return <PlanList user={currentUser} onActivate={(planId) => { if (planId === 'vip0') alert('Plano já ativo!'); else { setPendingPlanId(planId); setShowDeposit(true); } }} />;
      case AppView.NETWORK:
        return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT:
        return <Account user={currentUser} onLogout={handleLogout} notifications={notifications} onUpdateUser={async (u) => { await supabase.from('profiles').update({ wallet_address: u.walletAddress, name: u.name, phone: u.phone }).eq('id', u.id); fetchUserProfile(u.id); }} />;
      case AppView.ADMIN:
        return <AdminPanel users={allUsers} deposits={deposits} withdrawals={withdrawals} onClose={() => setCurrentView(AppView.ACCOUNT)} onApproveDeposit={async (id) => { const req = deposits.find(d => d.id === id); if (req) { await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id); const u = allUsers.find(user => user.id === req.userId); if (u) await supabase.from('profiles').update({ balance: u.balance + (req.planId ? 0 : req.amount), active_plan_id: req.planId || u.activePlanId, total_invested: (u.totalInvested || 0) + req.amount }).eq('id', req.userId); fetchAdminData(); } }} onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }} onApproveWithdraw={async (id) => { await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id); fetchAdminData(); }} onRejectWithdraw={async (id) => { const req = withdrawals.find(w => w.id === id); if(req) await updateBalance(req.amount, req.userId); await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }} onUpdateStatus={async (id, s) => { await supabase.from('profiles').update({ status: s }).eq('id', id); fetchAdminData(); }} onDeleteUser={async (id) => { await supabase.from('profiles').delete().eq('id', id); fetchAdminData(); }} onGivePlan={async (id, p) => { await supabase.from('profiles').update({ active_plan_id: p }).eq('id', id); fetchAdminData(); }} onAdjustBalance={async (id, a) => { await updateBalance(a, id); fetchAdminData(); }} />;
      default:
        return <Home user={currentUser} updateBalance={updateBalance} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => {}} onOpenWheel={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative overflow-x-hidden shadow-2xl">
      {currentUser ? (
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          {renderContent()}
        </Layout>
      ) : (
        renderContent()
      )}

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showVipZero && <VipZeroModal onActivate={() => setShowVipZero(false)} />}
      {showWithdraw && currentUser && (
        <WithdrawModal user={currentUser} onClose={() => setShowWithdraw(false)} onSubmit={async (amt) => {
          const { error } = await supabase.from('withdrawals').insert({ user_id: currentUser.id, user_name: currentUser.name, amount: amt, wallet: currentUser.walletAddress || '', fee: amt * 0.05, status: 'PENDING' });
          if (!error) { await updateBalance(-amt); setShowWithdraw(false); alert('Saque solicitado!'); }
        }} />
      )}
      {showDeposit && (
        <DepositModal prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''} onClose={() => { setShowDeposit(false); setPendingPlanId(null); }} onConfirm={async (hash) => {
          const plan = PLANS.find(p => p.id === pendingPlanId);
          await supabase.from('deposits').insert({ user_id: currentUser?.id, user_name: currentUser?.name, amount: plan ? plan.investment : 0, hash, plan_id: pendingPlanId, status: 'PENDING' });
          setShowDeposit(false);
          alert('Depósito enviado para análise!');
        }} />
      )}
      {showWheel && currentUser && (
        <LuckyWheelModal user={currentUser} onClose={() => setShowWheel(false)} onWin={(prize) => updateBalance(prize)} />
      )}
    </div>
  );
};

export default App;
