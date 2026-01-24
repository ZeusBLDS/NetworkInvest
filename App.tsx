
import React, { useState, useEffect } from 'react';
import { AppView, User, Notification, DepositRequest, WithdrawRequest } from './types';
import { PLANS, APP_CONFIG, REFERRAL_RATES } from './constants';
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

// Fix: App component was previously truncated and returning void, now completed to return JSX and correctly typed.
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customWallet, setCustomWallet] = useState(APP_CONFIG.DEPOSIT_WALLET);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [myDeposits, setMyDeposits] = useState<DepositRequest[]>([]);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showVipZero, setShowVipZero] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const mapUserFromDB = (u: any): User => ({
    id: u.id,
    name: u.name || 'Usuário',
    email: u.email || '',
    phone: u.phone || '',
    referralCode: u.referral_code || '',
    referredBy: u.referred_by || 'Direto',
    balance: parseFloat(u.balance || 0),
    walletAddress: u.wallet_address || '',
    activePlanId: u.active_plan_id || 'vip0',
    joinDate: new Date(u.created_at).getTime(),
    lastCheckIn: u.last_check_in ? new Date(u.last_check_in).getTime() : undefined,
    lastWheelSpin: u.last_wheel_spin ? new Date(u.last_wheel_spin).getTime() : undefined,
    checkInStreak: u.check_in_streak || 0,
    isFirstLogin: u.is_first_login ?? false,
    role: u.role || 'USER',
    status: u.status || 'ACTIVE',
    totalInvested: parseFloat(u.total_invested || 0),
    totalWithdrawn: parseFloat(u.total_withdrawn || 0),
    network_earnings: parseFloat(u.network_earnings || 0)
  });

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      if (data) {
        const user = mapUserFromDB(data);
        setCurrentUser(user);
        
        const { data: deps } = await supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (deps) setMyDeposits(deps.map((req: any) => ({
          id: req.id, userId: req.user_id, userName: req.user_name,
          amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
          status: req.status, timestamp: new Date(req.created_at).getTime(), method: 'USDT'
        })));

        if (user.role === 'ADMIN') await fetchAdminData();
        if (user.isFirstLogin) {
          setShowWelcome(true);
          setShowVipZero(true);
          await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        }

        if (currentView === AppView.LOGIN || currentView === AppView.REGISTER) {
          setCurrentView(AppView.HOME);
        }
        setLoading(false);
      } else if (retryCount < 3) {
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 2000);
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: authUser.id,
            name: authUser.user_metadata.name || 'Usuário',
            email: authUser.email,
            phone: authUser.user_metadata.phone || '',
            referred_by: authUser.user_metadata.referred_by || 'Direto',
            referral_code: Math.random().toString(36).substring(2, 10).toUpperCase()
          });
          if (!insertError) fetchUserProfile(userId);
          else { setLoading(false); supabase.auth.signOut(); }
        }
      }
    } catch (e) { 
      setLoading(false); 
    }
  };

  const fetchAdminData = async () => {
    try {
      const [{ data: profiles }, { data: deps }, { data: withs }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
      ]);
      if (profiles) setAllUsers(profiles.map(mapUserFromDB));
      if (deps) setDeposits(deps.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
        status: req.status, timestamp: new Date(req.created_at).getTime(), method: 'USDT'
      })));
      if (withs) setWithdrawals(withs.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), wallet: req.wallet, fee: parseFloat(req.fee || 0),
        status: req.status, timestamp: new Date(req.created_at).getTime()
      })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setLoading(true);
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
        setCurrentView(AppView.LOGIN);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const distributeNetworkCommissions = async (userId: string, planAmount: number) => {
    let currentId = userId;
    for (let level = 0; level < REFERRAL_RATES.length; level++) {
      const { data: p } = await supabase.from('profiles').select('referred_by').eq('id', currentId).single();
      if (!p || p.referred_by === 'Direto') break;
      const { data: referrer } = await supabase.from('profiles').select('*').eq('referral_code', p.referred_by).single();
      if (!referrer) break;
      const commission = planAmount * REFERRAL_RATES[level];
      await supabase.from('profiles').update({ 
        balance: (parseFloat(referrer.balance) || 0) + commission, 
        network_earnings: (parseFloat(referrer.network_earnings) || 0) + commission 
      }).eq('id', referrer.id);
      currentId = referrer.id;
    }
  };

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    const { data } = await supabase.from('profiles').select('balance').eq('id', id).single();
    if (data) {
      const newBalance = (parseFloat(data.balance) || 0) + amount;
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', id);
      if (id === currentUser?.id) fetchUserProfile(id);
    }
  };

  const performCheckIn = async () => {
    if (!currentUser) return;
    const now = new Date();
    const todayStr = now.toDateString();

    const { data: profile } = await supabase.from('profiles').select('last_check_in, balance, check_in_streak').eq('id', currentUser.id).single();
    if (!profile) return;

    const lastCheckIn = profile.last_check_in ? new Date(profile.last_check_in).toDateString() : '';
    if (lastCheckIn === todayStr) return;

    const newStreak = (profile.check_in_streak || 0) + 1;
    const reward = (newStreak % 30 || 30) * 0.01;
    const newBalance = (parseFloat(profile.balance) || 0) + reward;

    const { error } = await supabase.from('profiles').update({
      last_check_in: now.toISOString(),
      check_in_streak: newStreak,
      balance: newBalance
    }).eq('id', currentUser.id);

    if (!error) {
      fetchUserProfile(currentUser.id);
      return reward;
    }
  };

  const handleActivatePlan = (planId: string) => {
    setPendingPlanId(planId);
    setShowDeposit(true);
  };

  const handleConfirmDeposit = async (hash: string) => {
    if (!currentUser) return;
    const plan = pendingPlanId ? PLANS.find(p => p.id === pendingPlanId) : null;
    const { error } = await supabase.from('deposits').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount: plan ? plan.investment : 0,
      hash,
      plan_id: pendingPlanId,
      status: 'PENDING'
    });
    if (!error) {
      alert('Depósito enviado para verificação!');
      setShowDeposit(false);
      setPendingPlanId(null);
      fetchUserProfile(currentUser.id);
    }
  };

  const handleWithdrawSubmit = async (amount: number) => {
    if (!currentUser) return;
    const fee = amount * 0.05;
    const { error } = await supabase.from('withdrawals').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount,
      wallet: currentUser.walletAddress || '',
      fee,
      status: 'PENDING'
    });
    if (!error) {
      await updateBalance(-amount);
      alert('Pedido de saque realizado!');
      setShowWithdraw(false);
    }
  };

  const handleWheelWin = async (amount: number) => {
    if (!currentUser) return;
    await updateBalance(amount);
  };

  const renderView = () => {
    if (!currentUser) return null;
    switch (currentView) {
      case AppView.HOME: return <Home user={currentUser} myDeposits={myDeposits} updateBalance={updateBalance} performCheckIn={performCheckIn} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => setShowDeposit(true)} onOpenWheel={() => setShowWheel(true)} />;
      case AppView.PLANS: return <PlanList user={currentUser} myDeposits={myDeposits} onActivate={handleActivatePlan} />;
      case AppView.NETWORK: return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT: return <Account user={currentUser} onLogout={() => supabase.auth.signOut()} onUpdateUser={async (u) => { await supabase.from('profiles').update({ wallet_address: u.walletAddress }).eq('id', u.id); fetchUserProfile(u.id); }} onViewChange={setCurrentView} notifications={[]} />;
      case AppView.ADMIN: return (
        <AdminPanel 
          users={allUsers} deposits={deposits} withdrawals={withdrawals} depositWallet={customWallet}
          onUpdateWallet={setCustomWallet} onClose={() => setCurrentView(AppView.ACCOUNT)}
          onApproveDeposit={async (id) => {
            const dep = deposits.find(d => d.id === id);
            if (!dep) return;
            await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id);
            await updateBalance(dep.amount, dep.userId);
            if (dep.planId) {
              await supabase.from('profiles').update({ active_plan_id: dep.planId, total_invested: dep.amount }).eq('id', dep.userId);
              await distributeNetworkCommissions(dep.userId, dep.amount);
            }
            fetchAdminData();
          }}
          onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }}
          onApproveWithdraw={async (id) => {
            const wit = withdrawals.find(w => w.id === id);
            if (!wit) return;
            await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id);
            const { data: u } = await supabase.from('profiles').select('total_withdrawn').eq('id', wit.userId).single();
            await supabase.from('profiles').update({ total_withdrawn: (parseFloat(u.total_withdrawn) || 0) + wit.amount }).eq('id', wit.userId);
            fetchAdminData();
          }}
          onRejectWithdraw={async (id) => {
            const wit = withdrawals.find(w => w.id === id);
            if (!wit) return;
            await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id);
            await updateBalance(wit.amount, wit.userId);
            fetchAdminData();
          }}
          onUpdateStatus={async (id, s) => { await supabase.from('profiles').update({ status: s }).eq('id', id); fetchAdminData(); }}
          onDeleteUser={async (id) => { await supabase.from('profiles').delete().eq('id', id); fetchAdminData(); }}
          onGivePlan={async (id, pid) => { await supabase.from('profiles').update({ active_plan_id: pid }).eq('id', id); fetchAdminData(); }}
          onAdjustBalance={async (id, a) => { await updateBalance(a, id); fetchAdminData(); }}
        />
      );
      default: return null;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-emerald-600 animate-pulse uppercase">Carregando...</div>;

  if (!currentUser) {
    if (currentView === AppView.REGISTER) return <Register onSwitch={() => setCurrentView(AppView.LOGIN)} onRegister={() => setCurrentView(AppView.LOGIN)} />;
    return <Login onSwitch={() => setCurrentView(AppView.REGISTER)} onLogin={() => {}} />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showVipZero && <VipZeroModal onActivate={async () => { await supabase.from('profiles').update({ active_plan_id: 'vip0' }).eq('id', currentUser.id); setShowVipZero(false); fetchUserProfile(currentUser.id); }} />}
      {showWithdraw && <WithdrawModal user={currentUser} onClose={() => setShowWithdraw(false)} onSubmit={handleWithdrawSubmit} />}
      {showDeposit && <DepositModal wallet={customWallet} onClose={() => { setShowDeposit(false); setPendingPlanId(null); }} onConfirm={handleConfirmDeposit} prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''} />}
      {showWheel && <LuckyWheelModal user={currentUser} onClose={() => setShowWheel(false)} onWin={handleWheelWin} />}
    </Layout>
  );
};

// Fix: Missing default export addressed here.
export default App;
