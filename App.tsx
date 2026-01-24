
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
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showVipZero, setShowVipZero] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

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

  // Trigger para recarregar dados administrativos ao entrar na aba Admin
  useEffect(() => {
    if (currentUser?.role === 'ADMIN' && currentView === AppView.ADMIN) {
      fetchAdminData();
    }
  }, [currentView, currentUser]);

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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
          lastCheckIn: user.last_check_in ? new Date(user.last_check_in).getTime() : undefined,
          lastWheelSpin: user.last_wheel_spin ? new Date(user.last_wheel_spin).getTime() : undefined
        };

        setCurrentUser(normalizedUser);
        
        if (normalizedUser.isFirstLogin) {
          setShowWelcome(true);
          setShowVipZero(true);
          await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        }

        if (normalizedUser.role === 'ADMIN') fetchAdminData();
        setLoading(false);
      } else {
        if (retryCount < 2) {
          setTimeout(() => fetchUserProfile(userId, retryCount + 1), 2000);
        } else {
          setAuthError("Erro ao carregar perfil.");
          setLoading(false);
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [u, d, w] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
      ]);

      if (u.data) {
        setAllUsers(u.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          balance: parseFloat(user.balance || 0),
          activePlanId: user.active_plan_id || 'vip0',
          totalInvested: parseFloat(user.total_invested || 0),
          totalWithdrawn: parseFloat(user.total_withdrawn || 0),
          status: user.status || 'ACTIVE',
          role: user.role
        })) as any);
      }
      
      if (d.data) setDeposits(d.data.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
        status: req.status, timestamp: new Date(req.created_at).getTime(), method: 'USDT'
      })) as any);

      if (w.data) setWithdrawals(w.data.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), wallet: req.wallet, fee: parseFloat(req.fee),
        status: req.status, timestamp: new Date(req.created_at).getTime()
      })) as any);
    } catch (e) {
      console.error("Admin Data Error:", e);
    }
  };

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    const { data } = await supabase.from('profiles').select('balance').eq('id', id).single();
    if (data) {
      await supabase.from('profiles').update({ balance: (data.balance || 0) + amount }).eq('id', id);
      if (id === currentUser?.id) fetchUserProfile(id);
      else fetchAdminData();
    }
  };

  const performCheckIn = async () => {
    if (!currentUser) return;
    const now = new Date();
    const todayStr = now.toDateString();
    if (currentUser.lastCheckIn && new Date(currentUser.lastCheckIn).toDateString() === todayStr) {
      alert('Check-in já realizado hoje!');
      return;
    }
    let newStreak = (currentUser.checkInStreak || 0) + 1;
    const reward = newStreak * 0.01;
    try {
      const { error } = await supabase.from('profiles').update({ balance: currentUser.balance + reward, last_check_in: now.toISOString(), check_in_streak: newStreak }).eq('id', currentUser.id);
      if (error) throw error;
      fetchUserProfile(currentUser.id);
      return reward;
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleWheelWin = async (prize: number) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from('profiles').update({ balance: currentUser.balance + prize, last_wheel_spin: new Date().toISOString() }).eq('id', currentUser.id);
      if (error) throw error;
      fetchUserProfile(currentUser.id);
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-900 text-white p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="font-bold tracking-widest animate-pulse">NETWORK INVEST</p>
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
        return <Home user={currentUser} updateBalance={updateBalance} performCheckIn={performCheckIn} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => { setPendingPlanId(null); setShowDeposit(true); }} onOpenWheel={() => setShowWheel(true)} />;
      case AppView.PLANS:
        return <PlanList user={currentUser} onActivate={(planId) => { if (currentUser.activePlanId === planId) alert('Plano já ativo!'); else { setPendingPlanId(planId); setShowDeposit(true); } }} />;
      case AppView.NETWORK:
        return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT:
        return <Account user={currentUser} onLogout={() => supabase.auth.signOut()} notifications={notifications} onViewChange={setCurrentView} onUpdateUser={async (u) => { await supabase.from('profiles').update({ wallet_address: u.walletAddress }).eq('id', u.id); fetchUserProfile(u.id); }} />;
      case AppView.ADMIN:
        return <AdminPanel 
          users={allUsers} 
          deposits={deposits} 
          withdrawals={withdrawals} 
          onClose={() => setCurrentView(AppView.ACCOUNT)} 
          onApproveDeposit={async (id) => { 
            const req = deposits.find(d => d.id === id);
            if (req) {
              await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id);
              const u = allUsers.find(user => user.id === req.userId);
              if (u) {
                const updatePayload: any = {
                  active_plan_id: req.planId || u.activePlanId,
                  total_invested: (u.totalInvested || 0) + req.amount
                };
                // Se for depósito comum (sem plano), adiciona ao saldo
                if (!req.planId) {
                   updatePayload.balance = u.balance + req.amount;
                }
                const { error: profileError } = await supabase.from('profiles').update(updatePayload).eq('id', req.userId);
                if (profileError) console.error("Erro ao atualizar perfil:", profileError);
                
                // Força atualização para o usuário se ele for o admin testando ou através de reload manual posterior
                fetchAdminData();
                if (currentUser?.id === req.userId) fetchUserProfile(req.userId);
                alert("Depósito/Plano Aprovado com Sucesso!");
              }
            }
          }} 
          onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }} 
          onApproveWithdraw={async (id) => { await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id); fetchAdminData(); }} 
          onRejectWithdraw={async (id) => { const req = withdrawals.find(w => w.id === id); if(req) await updateBalance(req.amount, req.userId); await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }} 
          onUpdateStatus={async (id, s) => { await supabase.from('profiles').update({ status: s }).eq('id', id); fetchAdminData(); }} 
          onDeleteUser={async (id) => { if(confirm("Deseja realmente excluir este usuário?")) { await supabase.from('profiles').delete().eq('id', id); fetchAdminData(); } }} 
          onGivePlan={async (id, p) => { await supabase.from('profiles').update({ active_plan_id: p }).eq('id', id); fetchAdminData(); }} 
          onAdjustBalance={async (id, a) => { await updateBalance(a, id); }} />;
      default:
        return <Home user={currentUser} updateBalance={updateBalance} performCheckIn={performCheckIn} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => {}} onOpenWheel={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative overflow-x-hidden shadow-2xl">
      {currentUser && currentView !== AppView.ADMIN ? (
        <Layout currentView={currentView} onViewChange={setCurrentView}>{renderContent()}</Layout>
      ) : renderContent()}

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
          setShowDeposit(false); alert('Depósito enviado!');
        }} />
      )}
      {showWheel && currentUser && <LuckyWheelModal user={currentUser} onClose={() => setShowWheel(false)} onWin={handleWheelWin} />}
    </div>
  );
};

export default App;
